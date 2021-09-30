import semver from 'semver'
import type { Argv } from 'yargs'
import { ask, builtinYi8n, defineCommandModule, execa, logger, requireFromProject, spawn } from '../lib/utils'

interface OutdatedPackageData {
  current: string,
  wanted: string,
  latest: string,
  location: string,
}

const defaultPostInstall: Record<string, string> = {
  '@cyansalt/eslint-config': 'npx @cyansalt/eslint-config --update -y',
  '@cyansalt/stylelint-config': 'npx @cyansalt/stylelint-config --update -y',
}

export default defineCommandModule({
  command: 'update',
  describe: builtinYi8n.__('Update dependencies'),
  builder: (yargs: Argv) => {
    return yargs
      .options({
        packages: {
          describe: builtinYi8n.__('Packages that should be checked'),
          type: 'string',
          array: true,
          default: [] as string[],
          coerce: (value: string[]) => value.map(item => new RegExp(item)),
        },
        latestPackages: {
          describe: builtinYi8n.__('Packages that should be checked without considering semver ranges'),
          type: 'string',
          array: true,
          default: [] as string[],
          coerce: (value: string[]) => value.map(item => new RegExp(item)),
        },
        postinstall: {
          describe: builtinYi8n.__('Scripts that will be executed after specified packages installed'),
          default: defaultPostInstall,
          defaultDescription: '<@cyansalt/*>',
        },
        yes: {
          describe: builtinYi8n.__('Whether to skip the prompt question'),
          alias: 'y',
          type: 'boolean',
        },
        lock: {
          describe: builtinYi8n.__('Whether to update all dependencies in the lock file'),
          type: 'boolean',
        },
      })
  },
  async handler(argv) {
    const {
      packages,
      latestPackages,
      postinstall,
      lock,
    } = argv
    let versions: Record<string, string>
    try {
      const { stdout } = await execa('npm version')
      versions = JSON.parse(stdout)
    } catch {
      versions = {}
    }
    let outdated: Record<string, OutdatedPackageData>
    try {
      const result = await execa(`${semver.satisfies(versions.npm, '>=7') ? 'npm' : 'npx npm@latest'} outdated --json${lock ? ' --all' : ''}`)
      outdated = JSON.parse(result.stdout)
    } catch (err) {
      outdated = JSON.parse(err.stdout)
    }
    if (!Object.keys(outdated).length) {
      logger.warn('Already up-to-date.')
      return
    }
    let info: Record<string, any>
    if (lock) {
      try {
        const result = await execa('npm ls --json --depth=0')
        info = JSON.parse(result.stdout)
      } catch (err) {
        info = JSON.parse(err.stdout)
      }
    }
    const latestDeps = Object.keys(outdated)
      .filter(name => latestPackages.some(pattern => pattern.test(name)))
    const semverDeps = Object.keys(outdated)
      .filter(name => packages.some(pattern => pattern.test(name)))
      .filter(name => !latestDeps.includes(name))
    let outdatedDeps = [...latestDeps, ...semverDeps]
    outdatedDeps.forEach((name, index) => {
      const entry = outdated[name]
      try {
        // In the case of --lock, `entry.current` may not be the version in the root module directory
        entry['_version'] = requireFromProject(`${name}/package.json`).version
      } catch {
        // There may be an ERR_PACKAGE_PATH_NOT_EXPORTED error
        entry['_version'] = entry.current
      }
      entry['_target'] = index < latestDeps.length ? entry.latest : entry.wanted
    })
    // More aggressive versions may be in use
    outdatedDeps = outdatedDeps.filter(name => {
      const entry = outdated[name]
      return semver.lt(entry['_version'], entry['_target'])
    })
    if (!outdatedDeps.length) {
      logger.warn('Some packages are outdated, but none of them meet the specified conditions.')
      return
    }
    logger.info([
      `${outdatedDeps.length} package${outdatedDeps.length > 1 ? 's are' : ' is'} outdated:\n`,
      ...outdatedDeps.map(name => {
        const entry = outdated[name]
        return `- ${name}: ${entry['_version']} => ${entry['_target']}`
      }),
      '',
    ].join('\n'))
    if (!argv.yes) {
      const result = await ask('Continue? (Y/n) ')
      if (!result) return
    }
    const scripts = outdatedDeps
      .map(name => postinstall[name])
      .filter(Boolean)
    const indirectDeps = lock
      ? outdatedDeps.filter(name => !info.dependencies[name])
      : []
    const installCommand = [
      'npm install',
      ...semverDeps,
      ...latestDeps.map(name => `${name}@latest`),
      ...scripts.map(script => `&& ${script}`),
      '&& npm dedupe',
      ...(indirectDeps.length ? [
        '&& npm uninstall',
        ...indirectDeps,
        // Avoid major version changes
        '&& npm dedupe',
      ] : []),
    ].join(' ')
    spawn(installCommand)
  },
})

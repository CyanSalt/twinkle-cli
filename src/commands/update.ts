import semver from 'semver'
import type { Argv } from 'yargs'
import { ask, builtinYi8n, defineCommandModule, execa, getNPMClient, logger, requireFromProject, spawn } from '../lib/utils'

interface OutdatedPackageData {
  current: string,
  wanted: string,
  latest: string,
  location: string,
}

function getDefaultPostInstall() {
  const npmClient = getNPMClient()
  const isYarn = npmClient === 'yarn'
  return {
    '@cyansalt/eslint-config': `${isYarn ? 'yarn ' : 'npx @cyansalt/'}eslint-config --update -y`,
    '@cyansalt/stylelint-config': `${isYarn ? 'yarn ' : 'npx @cyansalt/'}stylelint-config --update -y`,
  }
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
        latest: {
          describe: builtinYi8n.__('Whether to check packages without considering semver ranges'),
          type: 'boolean',
          default: true,
        },
        postinstall: {
          describe: builtinYi8n.__('Scripts that will be executed after specified packages installed'),
          default: (() => getDefaultPostInstall()) as unknown as Record<string, string>,
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
      latest,
      postinstall,
      lock,
    } = argv
    let outdated: Record<string, OutdatedPackageData>
    try {
      const result = await execa(`npm outdated --json${lock ? ' --all' : ''}`)
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
    let outdatedDeps = Object.keys(outdated)
      .filter(name => packages.some(pattern => pattern.test(name)))
    outdatedDeps.forEach((name, index) => {
      const entry = outdated[name]
      try {
        // In the case of --lock, `entry.current` may not be the version in the root module directory
        entry['_version'] = requireFromProject(`${name}/package.json`).version
      } catch {
        // There may be an ERR_PACKAGE_PATH_NOT_EXPORTED error
        entry['_version'] = entry.current
      }
      entry['_target'] = latest ? entry.latest : entry.wanted
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
    const npmClient = getNPMClient()
    const isYarn = npmClient === 'yarn'
    const installCommand = [
      isYarn ? 'yarn add' : 'npm install',
      ...(latest ? outdatedDeps.map(name => `${name}@latest`) : outdatedDeps),
      ...scripts.map(script => `&& ${script}`),
      isYarn ? '' : '&& npm dedupe',
      ...(indirectDeps.length ? [
        '&&',
        isYarn ? 'yarn remove' : 'npm uninstall',
        ...indirectDeps,
        // Avoid major version changes
        isYarn ? '' : '&& npm dedupe',
      ] : []),
    ].join(' ')
    spawn(installCommand)
  },
})

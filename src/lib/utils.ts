import * as childProcess from 'child_process'
import * as path from 'path'
import * as readline from 'readline'
import * as util from 'util'
import chalk from 'chalk'
import type { Options as FindUpOptions } from 'find-up'
import { findUpSync } from 'find-up'
import resolveFrom from 'resolve-from'
import y18n from 'y18n'
import type { CommandModule } from 'yargs'
import yargs from 'yargs'

export { Argv } from 'yargs'

// @ts-expect-error error typings in @types/y18n
export const createY18nFrom = (directory: string) => y18n({
  directory,
  locale: yargs.locale(),
  updateFiles: false,
})

export const builtinYi8n = createY18nFrom(
  path.resolve(__dirname, '../../locales'),
)

export function defineCommandModule<T, U>(command: CommandModule<T, U>) {
  return command
}

export const execa = util.promisify(childProcess.exec)

export function spawn(command: string) {
  const child = childProcess.spawn(command, { shell: true, stdio: 'inherit' })
  const promise = new Promise((resolve, reject) => {
    child.on('close', (code, signal) => {
      resolve({ code, signal })
    })
    child.on('error', reject)
  }) as childProcess.PromiseWithChild<{ code: number | null, signal: NodeJS.Signals | null }>
  promise.child = child
  return promise
}

export const uniq = <T>(arr: T[]) => [...new Set(arr)]

export const logger = {
  info(message: string) {
    console.log(chalk.inverse(chalk.blue(' INFO ')) + ' ' + message)
  },
  done(message: string) {
    console.log(chalk.inverse(chalk.green(' DONE ')) + ' ' + message)
  },
  warn(message: string) {
    console.log(chalk.inverse(chalk.yellow(' WARN ')) + ' ' + chalk.yellow(message))
  },
  error(message: string) {
    console.error(chalk.inverse(chalk.red(' ERROR ')) + ' ' + chalk.red(message))
  },
}

export async function ask(question) {
  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    rl.question(question, answer => {
      rl.close()
      resolve(['', 'y', 'Y'].includes(answer))
    })
  })
}

export function resolveFromProject(moduleId: string, options?: FindUpOptions) {
  const nearestPackageJson = findUpSync('package.json', options)
  if (!nearestPackageJson) {
    throw new Error(`Cannot find module '${moduleId}'`)
  }
  return resolveFrom(path.dirname(nearestPackageJson), moduleId)
}

export function requireFromProject(moduleId: string, options?: FindUpOptions) {
  const absolutePath = resolveFromProject(moduleId, options)
  if (absolutePath) {
    try {
      return require(absolutePath)
    } catch {
      // fallback to local require
    }
  }
  return require(moduleId)
}

export function loadVueCLIEnv(env?: string) {
  try {
    const Service = requireFromProject('@vue/cli-service')
    const service = new Service(process.cwd())
    if (env) {
      service.loadEnv(env)
    }
    service.loadEnv()
  } catch {
    // ignore error
  }
}

export function allSettled<T>(promises: Promise<T>[]) {
  return Promise.all(promises.map(promise => promise.then(
    value => ({ status: 'fulfilled' as const, value }),
    reason => ({ status: 'rejected' as const, reason }),
  )))
}

export async function gitGitCommittish(committish: string) {
  try {
    const { stdout } = await execa(`git rev-parse -q --verify ${committish}`)
    return stdout.trim()
  } catch {
    return ''
  }
}

export function importDefault(obj: any) {
  return obj?.__esModule ? obj.default : obj
}

export function getInstalledPackages(options?: FindUpOptions) {
  let isGlobal = false
  let pkg: Record<string, any>
  try {
    pkg = requireFromProject('./package.json', options)
  } catch {
    isGlobal = true
    const stdout = childProcess.execSync('npm list -g --depth=0 --json')
    pkg = JSON.parse(String(stdout))
  }
  let deps: string[] = []
  if (pkg.dependencies) {
    deps = deps.concat(Object.keys(pkg.dependencies))
  }
  if (pkg.devDependencies) {
    deps = deps.concat(Object.keys(pkg.devDependencies))
  }
  return {
    dependencies: deps,
    isGlobal,
  }
}

export function moduleIdStartsWith(moduleId: string, prefix: string) {
  if (moduleId.startsWith(prefix + '-')) {
    return true
  }
  if (moduleId.startsWith('@')) {
    const submoduleId = moduleId.split('/')[1]
    return Boolean(submoduleId) && (
      submoduleId === prefix || submoduleId.startsWith(prefix + '-')
    )
  }
  return false
}

export function omit(source: {}, keys: string[]) {
  return Object.fromEntries(Object.entries(source).filter(([key]) => !keys.includes(key)))
}

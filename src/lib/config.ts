import { cosmiconfigSync } from 'cosmiconfig'
import type { Arguments, Argv, MiddlewareFunction } from 'yargs'
import yargsParser from 'yargs-parser'
import { omit } from './utils'

export function getConfigurations() {
  const result = cosmiconfigSync('twinkle').search(process.cwd())
  return result?.config ?? {}
}

export function getConfigurationPath() {
  const result = cosmiconfigSync('twinkle').search(process.cwd())
  return result?.filepath
}

export const configMiddleware = ((argv: Arguments<{}>, yargs: Argv) => {
  if (!yargs.parsed) return
  const allConfigs = getConfigurations()
  const command = argv._[0]
  let config = allConfigs[command]
  if (!config) return
  if (typeof config === 'function') {
    config = config(argv)
  }
  const { aliases, configuration } = yargs.parsed
  const configArgv = yargsParser(process.argv.slice(2), {
    alias: aliases,
    configuration,
    // @ts-expect-error issue of @types/yargs-parser
    configObjects: [config],
  })
  const userArgv = yargsParser(process.argv.slice(2), {
    alias: aliases,
    configuration,
  })
  Object.assign(argv, omit(configArgv, Object.keys(userArgv)))
}) as MiddlewareFunction

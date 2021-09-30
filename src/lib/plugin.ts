import type { Argv } from 'yargs'
import { getConfigurationPath } from './config'
import { getInstalledPackages, importDefault, moduleIdStartsWith, requireFromProject } from './utils'

export function applyPlugins(yargs: Argv) {
  const configPath = getConfigurationPath()
  const {
    isGlobal,
    dependencies,
  } = getInstalledPackages({ cwd: configPath })
  const commands = dependencies
    .filter(moduleId => moduleIdStartsWith(moduleId, 'twinkle-plugin'))
    .map(
      isGlobal
        ? dep => require(dep)
        : dep => importDefault(requireFromProject(dep)),
    )
  commands.forEach(command => {
    yargs.command(command)
  })
  return yargs
}

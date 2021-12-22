import yargs from 'yargs'
import { configMiddleware } from './lib/config'
import { applyPlugins } from './lib/plugin'
import { importDefault } from './lib/utils'

yargs
  .scriptName('twinkle')
  .middleware(configMiddleware, true)
  .commandDir('./commands', { visit: importDefault })
  .recommendCommands()
  .demandCommand()
  .strict()

applyPlugins(yargs)
  .parse()

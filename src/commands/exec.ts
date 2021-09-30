import yargs from 'yargs'
import type { Argv } from 'yargs'
import { builtinYi8n, defineCommandModule, importDefault, requireFromProject, spawn } from '../lib/utils'

export default defineCommandModule({
  command: 'exec [command]',
  describe: builtinYi8n.__('Run a command from local or remote'),
  // eslint-disable-next-line @typescript-eslint/no-shadow
  builder: (yargs: Argv) => {
    return yargs
      .option('command', {
        describe: builtinYi8n.__('Command to run'),
        type: 'string',
        required: true,
      })
      .options({
        package: {
          describe: builtinYi8n.__('Remote package name'),
          alias: 'p',
          type: 'string',
        },
        scope: {
          describe: builtinYi8n.__('Remote package scope'),
          type: 'string',
        },
      })
  },
  async handler(argv) {
    const { command, scope } = argv

    await 'for loading all commands and plugins'
    const instance = (yargs as any).getCommandInstance()
    if (!instance.getCommands().includes(command)) {
      let pkg = argv.package
      if (!pkg) {
        pkg = argv.scope
          ? `${scope}/twinkle-plugin-${command}`
          : `twinkle-plugin-${command}`
      }
      let plugin: any
      try {
        plugin = requireFromProject(pkg)
      } catch {
        await spawn(`npm install --no-save ${pkg}`)
        plugin = requireFromProject(pkg)
      }
      yargs.command(importDefault(plugin))
    }

    yargs.parse([command, ...argv._.slice(1).map(String)])
  },
})

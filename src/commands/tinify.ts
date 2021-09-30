import type { Argv } from 'yargs'
import { allSettled, builtinYi8n, defineCommandModule, execa, gitGitCommittish, logger, requireFromProject } from '../lib/utils'

export default defineCommandModule({
  command: 'tinify [files..]',
  describe: builtinYi8n.__('Tinify images by TinyPNG'),
  builder: (yargs: Argv) => {
    return yargs
      .positional('files', {
        describe: builtinYi8n.__('Image files to be compressed'),
        type: 'string',
        array: true,
      })
      .options({
        key: {
          describe: builtinYi8n.__('The API key of TinyPNG'),
          required: true,
          type: 'string',
        },
        staged: {
          describe: builtinYi8n.__('Whether compressing images with staging status of Git (e.g. in Git pre-commit hook)'),
          type: 'boolean',
          default: false,
        },
      })
  },
  async handler(argv) {
    if (argv.staged) {
      const id = await gitGitCommittish('MERGE_HEAD')
      if (id) {
        logger.warn('MERGING, skipped.')
        return
      }
    }

    const tinify = requireFromProject('tinify')
    tinify.key = argv.key

    const list = argv.files ?? []
    const results = await allSettled(list.map(file => tinify.fromFile(file).toFile(file)))
    const rejectedResult = results.find(
      (result): result is { status: 'rejected', reason: any } => result.status === 'rejected',
    )
    if (rejectedResult) {
      if (rejectedResult.reason.status === 429) {
        execa('open https://tinify.com/dashboard/api')
      }
      logger.error(rejectedResult.reason.message)
      process.exitCode = 1
    } else {
      logger.done(`${list.length} ${list.length <= 1 ? 'image has' : 'images have'} been tinified.`)
    }
  },
})

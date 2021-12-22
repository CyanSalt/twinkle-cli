import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import type { Argv } from 'yargs'
import { builtinYi8n, defineCommandModule, execa, logger } from '../lib/utils'

interface Replacement {
  content: string,
  name?: string,
}
type Lazy<T> = T | Promise<T>
type Transformer = (content: string) => Lazy<string | Replacement | Replacement[]>

const defaultIgnoredFiles = [
  'demo_index.html',
  'demo.css',
  'iconfont.json',
]

export default defineCommandModule({
  command: 'iconfont [file]',
  describe: builtinYi8n.__('Extract icons from iconfont.cn'),
  builder: (yargs: Argv) => {
    return yargs
      .positional('file', {
        describe: builtinYi8n.__('A ZIP file of icons'),
        type: 'string',
        default: (() => path.join(os.homedir(), '/Downloads/download.zip')) as unknown as string,
      })
      .options({
        output: {
          describe: builtinYi8n.__('The target directory for generated files'),
          required: true,
          type: 'string',
        },
        ignoreFiles: {
          describe: builtinYi8n.__('List of files which should be ignored'),
          default: defaultIgnoredFiles,
        },
        iconfontURL: {
          describe: builtinYi8n.__('The URL address of the iconfont project'),
        },
        transformer: {
          describe: builtinYi8n.__('A mapping of custom file transformer functions'),
          coerce: (value?: Record<string, Transformer>) => value,
        },
        prune: {
          describe: builtinYi8n.__('Whether to prune the file after generating'),
          type: 'boolean',
          default: false,
        },
      })
  },
  async handler(argv) {
    const {
      file,
      ignoreFiles,
      output,
      iconfontURL,
      transformer,
      prune,
    } = argv

    // 检查 zip
    if (path.extname(file) !== '.zip') {
      logger.error('A ZIP file should be given.')
      process.exitCode = 1
      return
    }

    try {
      await fs.promises.access(file, fs.constants.R_OK)
    } catch {
      logger.warn('The ZIP file of icons is not found. Please download it first.')
      if (iconfontURL) {
        execa(`open "${iconfontURL}"`)
      }
      process.exitCode = 1
      return
    }

    // 删除 output
    await fs.promises.rm(output, { recursive: true })

    // 解压处理
    await execa(`unzip -j ${file} -d ${output}`)

    await ignoreFiles.map(basename => {
      return fs.promises.unlink(path.join(output, basename))
    })

    if (transformer) {
      await Promise.all(Object.keys(transformer).map(async item => {
        const itemPath = path.join(output, item)
        const content = await fs.promises.readFile(itemPath)
        let result = await transformer[item](content.toString())
        if (typeof result === 'string') {
          result = { content: result }
        }
        if (!Array.isArray(result)) {
          result = [result]
        }
        return Promise.all(result.map(replacement => {
          const outputFile = replacement.name
            ? path.join(output, replacement.name) : itemPath
          return fs.promises.writeFile(outputFile, replacement.content)
        }))
      }))
    }

    if (prune) {
      await fs.promises.unlink(file)
    }
    logger.done('Generated successfully.')
  },
})

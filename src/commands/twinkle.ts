import chalk from 'chalk'
import { defineCommandModule } from '../lib/utils'

export default defineCommandModule({
  command: 'twinkle',
  describe: false,
  handler() {
    console.log(chalk.red('Twinkle twinkle little star'))
    console.log(chalk.green('How I wonder what you are'))
    console.log(chalk.yellow('Up above the world so high'))
    console.log(chalk.blue('Like a diamond in the sky'))
    console.log(chalk.magenta('Twinkle twinkle little star'))
    console.log(chalk.cyan('How I wonder what you are'))
  },
})

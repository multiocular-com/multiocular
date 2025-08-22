import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { format, print, printError } from './print.ts'

export interface Config {
  command: 'help' | 'run' | 'version'
  mode: 'changes' | 'commit'
  output: 'json' | 'server' | 'text'
}

async function printVersion(): Promise<void> {
  let packagePath = join(import.meta.dirname, '../../package.json')
  let packageData = JSON.parse(await readFile(packagePath, 'utf-8')) as {
    version: string
  }
  print('v' + packageData.version)
}

async function printHelp(): Promise<void> {
  let helpPath = join(import.meta.dirname, 'help.txt')
  print(format(await readFile(helpPath, 'utf-8')).trim())
}

export async function parseArgs(args: string[]): Promise<Config> {
  let config: Config = {
    command: 'run',
    mode: 'changes',
    output: 'server'
  }

  for (let arg of args) {
    if (arg === '--changed') {
      config.mode = 'changes'
    } else if (arg === '--commit') {
      config.mode = 'commit'
    } else if (arg === '--help' || arg === '-h') {
      await printHelp()
      process.exit(0)
    } else if (arg === '--json') {
      config.output = 'json'
    } else if (arg === '--server') {
      config.output = 'server'
    } else if (arg === '--text') {
      config.output = 'text'
    } else if (arg === '--version' || arg === '-v') {
      await printVersion()
      process.exit(0)
    } else {
      printError(format('Unknown argument `' + arg + '`'))
      process.exit(1)
    }
  }

  return config
}

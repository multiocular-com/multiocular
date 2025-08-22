import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

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
  process.stdout.write(packageData.version + '\n')
}

async function printHelp(): Promise<void> {
  let helpPath = join(import.meta.dirname, 'help.txt')
  process.stdout.write(await readFile(helpPath, 'utf-8'))
}

export async function parseArgs(args: string[]): Promise<Config> {
  let config: Config = {
    command: 'run',
    mode: 'changes',
    output: 'server'
  }

  for (let i = 0; i < args.length; i++) {
    let arg = args[i]

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
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  return config
}

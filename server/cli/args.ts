import { exec } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { promisify } from 'node:util'

import { format, print, printError } from './print.ts'

const execAsync = promisify(exec)

export interface Config {
  command: 'help' | 'run' | 'version'
  mode: 'changed' | 'commit'
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

async function detectModeFromGit(): Promise<Config['mode']> {
  try {
    let { stdout } = await execAsync('git status --porcelain')
    return stdout.trim() ? 'changed' : 'commit'
  } catch {
    return 'commit'
  }
}

export async function parseArgs(args: string[]): Promise<Config> {
  let config: Config = {
    command: 'run',
    mode: 'commit',
    output: 'server'
  }

  let mode = false

  for (let arg of args) {
    if (arg === '--changed') {
      config.mode = 'changed'
      mode = true
    } else if (arg === '--commit') {
      config.mode = 'commit'
      mode = true
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

  if (!mode) {
    config.mode = await detectModeFromGit()
  }

  return config
}

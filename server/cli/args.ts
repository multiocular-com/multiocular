import { exec } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { promisify } from 'node:util'

import { format, print, printError } from './print.ts'

const execAsync = promisify(exec)

export type CliArg =
  | '--changed'
  | '--debug'
  | '--help'
  | '--json'
  | '--last-commit'
  | '--text'
  | '--version'
  | '--web'
  | '-h'
  | '-v'
  | `--commit ${string}`

export type Config = {
  debug: boolean
  output: 'json' | 'text' | 'web'
} & (
  | { commit: string; source: 'commit' }
  | { source: 'changed' | 'last-commit' }
)

export async function getVersion(): Promise<string> {
  let packagePath = join(import.meta.dirname, '../../package.json')
  let packageData = JSON.parse(await readFile(packagePath, 'utf-8')) as {
    version: string
  }
  return packageData.version
}

async function printHelp(): Promise<void> {
  let helpPath = join(import.meta.dirname, 'help.txt')
  print(format(await readFile(helpPath, 'utf-8')).trim())
}

async function detectModeFromGit(): Promise<'changed' | 'last-commit'> {
  try {
    let { stdout } = await execAsync('git status --porcelain')
    return stdout.trim() ? 'changed' : 'last-commit'
  } catch {
    return 'last-commit'
  }
}

export async function parseArgs(args: string[]): Promise<Config> {
  let debug = false
  let output: Config['output'] = 'text'
  let source:
    | { commit: string; source: 'commit' }
    | { source: 'changed' | 'last-commit' }
    | undefined

  for (let i = 0; i < args.length; i++) {
    let arg = args[i]!
    if (arg === '--changed') {
      source = { source: 'changed' }
    } else if (arg === '--debug') {
      debug = true
    } else if (arg === '--last-commit') {
      source = { source: 'last-commit' }
    } else if (arg === '--commit') {
      let commit = args[++i]
      if (!commit || commit.startsWith('-')) {
        printError(format('--commit requires a commit hash'))
        process.exit(1)
      }
      source = { commit, source: 'commit' }
    } else if (arg === '--help' || arg === '-h') {
      await printHelp()
      process.exit(0)
    } else if (arg === '--json') {
      output = 'json'
    } else if (arg === '--web') {
      output = 'web'
    } else if (arg === '--text') {
      output = 'text'
    } else if (arg === '--version' || arg === '-v') {
      print('v' + (await getVersion()))
      process.exit(0)
    } else {
      printError(format('Unknown argument `' + arg + '`'))
      process.exit(1)
    }
  }

  if (!source) source = { source: await detectModeFromGit() }

  return { debug, output, ...source }
}

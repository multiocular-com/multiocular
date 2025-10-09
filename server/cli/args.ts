import { exec } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { promisify } from 'node:util'

import { type FilePath, filePathType } from '../../common/types.ts'
import { getUserFolder } from '../storage/file.ts'
import { format, print, printError } from './print.ts'
import { getVersion } from './version.ts'

const execAsync = promisify(exec)

export type CliArg =
  | '--changed'
  | '--debug'
  | '--help'
  | '--json'
  | '--last-commit'
  | '--no-open'
  | '--no-storage'
  | '--text'
  | '--version'
  | '--web'
  | '-h'
  | '-v'
  | `--commit ${string}`
  | `--port ${number}`
  | `--storage ${string}`

export type Config = {
  debug: boolean
  noOpen: boolean
  output: 'json' | 'text' | 'web'
  port: number
  storage: false | FilePath
} & (
  | { commit: string; source: 'commit' }
  | { source: 'changed' | 'last-commit' }
)

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
  let noOpen = false
  let output: Config['output'] | undefined
  let port = 31337
  let storage: false | FilePath | undefined
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
      if (!output) output = 'text'
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
    } else if (arg === '--no-open') {
      noOpen = true
    } else if (arg === '--port') {
      let portArg = args[++i]
      port = parseInt(portArg ?? '', 10)
      if (
        !portArg ||
        portArg.startsWith('-') ||
        isNaN(port) ||
        port < 1 ||
        port > 65535
      ) {
        printError(format('--port requires a port number'))
        process.exit(1)
      }
    } else if (arg === '--json') {
      output = 'json'
    } else if (arg === '--web') {
      output = 'web'
    } else if (arg === '--text') {
      output = 'text'
    } else if (arg === '--no-storage') {
      storage = false
    } else if (arg === '--storage') {
      let storageArg = args[++i]
      if (!storageArg || storageArg.startsWith('-')) {
        printError(format('--storage requires a folder path'))
        process.exit(1)
      }
      storage = filePathType(storageArg)
    } else if (arg === '--version' || arg === '-v') {
      print('v' + getVersion())
      process.exit(0)
    } else {
      printError(format('Unknown argument `' + arg + '`'))
      process.exit(1)
    }
  }

  if (!source) source = { source: await detectModeFromGit() }
  if (output === undefined) output = 'web'
  if (storage === undefined) storage = getUserFolder()

  return { debug, noOpen, output, port, storage, ...source }
}

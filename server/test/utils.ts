import assert from 'node:assert/strict'
import { exec, spawn } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import type { MultiocularJSON } from '../cli/output.ts'
import type { CliArg } from '../index.ts'

let currentProject: string | undefined
let currentDirectory: string | undefined

const TEST_ENV = {
  ...process.env,
  FORCE_COLOR: undefined,
  GIT_TERMINAL_PROMPT: '0',
  NO_COLOR: '1',
  SSH_AUTH_SOCK: ''
}

const BIN_PATH = process.env.TEST_BIN
  ? join(process.cwd(), process.env.TEST_BIN)
  : join(import.meta.dirname, '../bin.ts')

function getProject(): string {
  if (!currentProject) {
    throw new Error('No current project. Call startProject() first.')
  }
  return currentProject
}

export function run(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(
      command,
      {
        cwd: getProject(),
        env: TEST_ENV
      },
      (error, stdout) => {
        if (error) {
          reject(error)
        } else {
          resolve(stdout.trim())
        }
      }
    )
  })
}

export async function startProject(
  options: { git?: boolean } = { git: true }
): Promise<string> {
  currentProject = await mkdtemp(join(tmpdir(), 'multiocular-test-'))

  await run('pnpm init')

  if (options.git !== false) {
    await run('git init')
    await run('git config user.name "Test User"')
    await run('git config user.email "test@example.com"')
    await run('git config commit.gpgsign false')

    await writeFile(join(currentProject, '.gitignore'), 'node_modules\n')
    await run('git add .gitignore')
    await run('git commit -m "Initial commit"')
  }

  currentDirectory = currentProject
  return currentProject
}

export async function removeProject(): Promise<void> {
  if (!currentProject) return
  await rm(currentProject, { force: true, recursive: true })
  currentProject = undefined
  currentDirectory = undefined
}

export function cd(directory: string): void {
  currentDirectory = join(getProject(), directory)
}

export function runCli(
  ...args: CliArg[]
): Promise<{ code: null | number; stderr: string; stdout: string }> {
  let cwd = currentDirectory || process.cwd()
  let processedArgs: string[] = []

  for (let arg of args) {
    if (arg.startsWith('--commit ')) {
      processedArgs.push('--commit', arg.slice('--commit '.length))
    } else {
      processedArgs.push(arg)
    }
  }

  return new Promise(resolve => {
    let child = spawn(BIN_PATH, processedArgs, {
      cwd,
      env: TEST_ENV,
      stdio: ['pipe', 'pipe', 'pipe']
    })

    let stderr = ''
    let stdout = ''

    child.stdout.on('data', data => {
      stdout += data.toString()
    })

    child.stderr.on('data', data => {
      stderr += data.toString()
    })

    child.on('close', code => {
      resolve({ code, stderr, stdout })
    })
  })
}

export async function cliGood(...args: CliArg[]): Promise<string> {
  let result = await runCli(...args)
  if (result.code !== 0) {
    throw new Error(
      `Expected exit code 0, got ${result.code}\n${result.stderr}`
    )
  }
  if (result.stderr !== '') {
    throw new Error(`Expected empty stderr, got:\n${result.stderr}`)
  }
  return result.stdout
}

export async function cliBad(...args: CliArg[]): Promise<string> {
  let result = await runCli(...args)
  if (result.code === 0) {
    throw new Error('Expected non-zero exit code, got 0')
  }
  if (result.stdout !== '') {
    throw new Error(`Expected empty stdout, got: ${result.stdout}`)
  }
  return result.stderr
}

export async function cliJson(...args: CliArg[]): Promise<MultiocularJSON> {
  return JSON.parse(await cliGood('--json', ...args))
}

export async function cliJsonEqual(
  expected: MultiocularJSON,
  ...args: CliArg[]
): Promise<void> {
  assert.deepEqual(await cliJson(...args), expected)
}

type PartialMultiocularJSON = {
  [K in keyof MultiocularJSON[0]]?: MultiocularJSON[0][K] | RegExp
}[]

export async function cliJsonMatch(
  expected: PartialMultiocularJSON,
  ...args: CliArg[]
): Promise<void> {
  let actual = await cliJson(...args)
  let actualJson = JSON.stringify(actual, null, 2)
  assert.equal(
    actual.length,
    expected.length,
    `Expect ${expected.length} diffs\n${actualJson}`
  )
  for (let i = 0; i < expected.length; i++) {
    for (let [key, expectedValue] of Object.entries(expected[i]!)) {
      let actualValue = actual[i]![key as keyof MultiocularJSON[0]]
      if (expectedValue instanceof RegExp) {
        assert.match(
          String(actualValue),
          expectedValue,
          `${i}>${key} should match ${expectedValue}\n${actualJson}`
        )
      } else {
        assert.equal(
          actualValue,
          expectedValue,
          `${i}>${key} should equal ${expectedValue}\n${actualJson}`
        )
      }
    }
  }
}

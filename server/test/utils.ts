import { exec, spawn } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

let currentProject: string | undefined

const TEST_ENV = {
  ...process.env,
  FORCE_COLOR: undefined,
  GIT_TERMINAL_PROMPT: '0',
  NO_COLOR: '1',
  SSH_AUTH_SOCK: ''
}

const BIN_PATH = join(import.meta.dirname, '../bin.ts')

export function run(command: string): Promise<void> {
  if (!currentProject) {
    throw new Error('No current project. Call startProject() first.')
  }
  return new Promise((resolve, reject) => {
    exec(
      command,
      {
        cwd: currentProject,
        env: TEST_ENV
      },
      error => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      }
    )
  })
}

export async function startProject(
  options: { git?: boolean } = { git: true }
): Promise<string> {
  currentProject = await mkdtemp(join(tmpdir(), 'multiocular-test-'))

  if (options.git !== false) {
    await run('git init')
    await run('git config user.name "Test User"')
    await run('git config user.email "test@example.com"')
    await run('git config commit.gpgsign false')
  }

  return currentProject
}

export async function removeProject(): Promise<void> {
  if (!currentProject) return
  await rm(currentProject, { force: true, recursive: true })
  currentProject = undefined
}

export function runCli(
  args: string[],
  cwd = currentProject || process.cwd()
): Promise<{ code: null | number; stderr: string; stdout: string }> {
  return new Promise(resolve => {
    let child = spawn(BIN_PATH, args, {
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

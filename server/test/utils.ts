import { spawn } from 'node:child_process'
import { join } from 'node:path'

export function runCli(
  args: string[],
  cwd = process.cwd()
): Promise<{ code: null | number; stderr: string; stdout: string }> {
  return new Promise(resolve => {
    let binPath = join(import.meta.dirname, '../bin.ts')
    let child = spawn(binPath, args, {
      cwd,
      env: { ...process.env, FORCE_COLOR: undefined, NO_COLOR: '1' },
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

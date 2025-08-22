import { strict as assert } from 'node:assert'
import { spawn } from 'node:child_process'
import { test } from 'node:test'

function runCli(
  args: string[]
): Promise<{ code: null | number; stderr: string; stdout: string }> {
  return new Promise(resolve => {
    let child = spawn(
      'node',
      ['--import', 'jiti/register', 'server/bin.ts', ...args],
      {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      }
    )

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

test('shows version with -v and --version', async () => {
  for (let arg of ['-v', '--version']) {
    let result = await runCli([arg])
    assert.equal(result.code, 0)
    assert.match(result.stdout, /^\d+\.\d+\.\d+\n$/)
    assert.equal(result.stderr, '')
  }
})

test('shows help with -h and --help', async () => {
  for (let arg of ['-h', '--help']) {
    let result = await runCli([arg])
    assert.equal(result.code, 0)
    assert.match(
      result.stdout,
      /Tool to review the diffs on dependencies updates/
    )
    assert.match(result.stdout, /Usage:/)
    assert.match(result.stdout, /multiocular \[options\]/)
    assert.equal(result.stderr, '')
  }
})

import { strict as assert } from 'node:assert'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

import { runCli } from './utils.ts'

test('shows version with -v and --version', async () => {
  for (let arg of ['-v', '--version']) {
    let result = await runCli([arg])
    assert.equal(result.code, 0)
    assert.match(result.stdout, /^v\d+\.\d+\.\d+\n$/)
    assert.equal(result.stderr, '')
  }
})

test('shows help with -h and --help', async () => {
  for (let arg of ['-h', '--help']) {
    let result = await runCli([arg])
    assert.equal(result.code, 0)
    assert.match(result.stdout, /Usage:/)
    assert.equal(result.stderr, '')
  }
})

test('exits with error for unknown arguments', async () => {
  let result = await runCli(['--invalid'])
  assert.equal(result.code, 1)
  assert.match(result.stderr, /Unknown argument --invalid/)
  assert.equal(result.stdout, '')
})

test('exits with error when no .git folder found', async () => {
  let tempDir = await mkdtemp(join(tmpdir(), 'multiocular-test-'))
  try {
    let result = await runCli([], tempDir)

    assert.equal(result.code, 1)
    assert.match(result.stderr, /Could not find project root directory/)
    assert.equal(result.stdout, '')
  } finally {
    await rm(tempDir, { force: true, recursive: true })
  }
})

// TODO: test that it works in subdir

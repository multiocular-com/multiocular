import { strict as assert } from 'node:assert'
import { afterEach, test } from 'node:test'

import { cliBad, cliGood, removeProject, startProject } from './utils.ts'

afterEach(async () => {
  await removeProject()
})

test('shows version with -v and --version', async () => {
  assert.match(await cliGood('-v'), /^v\d+\.\d+\.\d+\n$/)
  assert.match(await cliGood('--version'), /^v\d+\.\d+\.\d+\n$/)
})

test('shows help with -h and --help', async () => {
  assert.match(await cliGood('-h'), /Usage:/)
  assert.match(await cliGood('--help'), /Usage:/)
})

test('exits with error for unknown arguments', async () => {
  // @ts-expect-error We are testing invalid argument
  assert.match(await cliBad('--invalid'), /Unknown argument --invalid/)
})

test('exits with error when no .git folder found', async () => {
  await startProject({ git: false })
  assert.match(await cliBad(), /Could not find project root directory/)
})

// TODO: test that it works in subdir

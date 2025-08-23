import { strict as assert } from 'node:assert'
import { afterEach, beforeEach, test } from 'node:test'

import { removeProject, run, runCli, startProject } from './utils.ts'

beforeEach(async () => {
  await startProject()
})

afterEach(async () => {
  await removeProject()
})

test('analyzes dependency changes between git commits', async () => {
  await run('pnpm init')
  await run('pnpm add postcss@8.5.5')
  await run('git add .')
  await run('git commit -m "Add postcss 8.5.5"')
  await run('pnpm add postcss@8.5.6')
  await run('git add .')
  await run('git commit -m "Update postcss to 8.5.6"')

  let result = await runCli(['--json'])

  assert.equal(result.code, 0)
  // TODO: test output when we will have implementation
})

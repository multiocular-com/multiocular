import { afterEach, beforeEach, test } from 'node:test'

import { cliGood, removeProject, run, startProject } from './utils.ts'

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

  await cliGood('--json')
  // TODO: test output when we will have implementation
})

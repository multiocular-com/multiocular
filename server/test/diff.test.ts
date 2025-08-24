import { strict as assert } from 'node:assert'
import { afterEach, beforeEach, test } from 'node:test'

import {
  cliJson,
  cliJsonEqual,
  removeProject,
  run,
  startProject
} from './utils.ts'

beforeEach(async () => {
  await startProject()
})

afterEach(async () => {
  await removeProject()
})

test('shows dependency changes', async () => {
  await run('pnpm add nanoid@5.1.4')
  await run('git add .')
  await run('git commit -m "Add nanoid"')
  await run('pnpm add nanoid@5.1.5')

  await cliJsonEqual([
    {
      after: '5.1.5',
      before: '5.1.4',
      diff: 'diff --git a/package.json b/package.json\nindex v5.1.4..v5.1.5 100644\n--- a/package.json\n+++ b/package.json\n@@ -1,6 +1,6 @@\n {\n   "name": "nanoid",\n-  "version": "5.1.4",\n+  "version": "5.1.5",\n   "description": "A tiny (118 bytes), secure URL-friendly unique string ID generator",\n   "keywords": [\n     "uuid",',
      name: 'nanoid',
      type: 'npm'
    }
  ])
})

test('shows new dependency', async () => {
  await run('pnpm add nanoid@5.1.5')
  let list = await cliJson()
  assert.equal(list.length, 1)
  assert.equal(list[0]!.name, 'nanoid')
  assert.equal(list[0]!.before, false)
  assert.match(list[0]!.diff, /"name": "nanoid"/)
})

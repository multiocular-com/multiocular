import { strict as assert } from 'node:assert'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { afterEach, test } from 'node:test'

import {
  cd,
  cliBad,
  cliGood,
  cliJsonMatch,
  removeProject,
  run,
  startProject
} from './utils.ts'

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

test('exits with error when --commit has no hash', async () => {
  // @ts-expect-error We are testing invalid argument
  assert.match(await cliBad('--commit'), /--commit requires a commit hash/)
})

test('exits with error when no .git folder found', async () => {
  await startProject({ git: false })
  assert.match(await cliBad(), /Could not find project root directory/)
})

test('allows to change update source', async () => {
  await startProject()
  await run('pnpm add nanoid@5.1.4')
  await run('git add .')
  await run('git commit -m "Add nanoid"')
  let commit = await run('git rev-parse HEAD')
  await run('pnpm add nanoid@5.1.5')

  await cliJsonMatch([{ after: '5.1.5' }], '--changed')
  await cliJsonMatch([{ after: '5.1.4' }], '--last-commit')
  await cliJsonMatch([{ after: '5.1.4' }], `--commit ${commit}`)
  await cliJsonMatch([{ after: '5.1.5' }])
})

test('works from subdirectory', async () => {
  let project = await startProject()
  await run('pnpm add nanoid@5.1.5')
  await mkdir(join(project, 'src'))
  cd('src')
  await cliJsonMatch([{ after: '5.1.5' }])
})

test('allows to change output format', async () => {
  await startProject()
  await run('pnpm add nanoid@5.1.4')
  await run('git add .')
  await run('git commit -m "Add nanoid"')
  await run('pnpm add nanoid@5.1.5')
  assert.equal(
    await cliGood('--text'),
    'diff --git npm:nanoid@5.1.4/package.json npm:nanoid@5.1.5/package.json\n' +
      'index v5.1.4..v5.1.5 100644\n' +
      '--- npm:nanoid@5.1.4/package.json\n' +
      '+++ npm:nanoid@5.1.5/package.json\n' +
      '@@ -1,6 +1,6 @@\n' +
      ' {\n' +
      '   "name": "nanoid",\n' +
      '-  "version": "5.1.4",\n' +
      '+  "version": "5.1.5",\n' +
      '   "description": "A tiny (118 bytes), secure URL-friendly unique string ID generator",\n' +
      '   "keywords": [\n' +
      '     "uuid",\n'
  )
})

test('is ready for no changes', async () => {
  await startProject()
  await run('pnpm add nanoid@5.1.4')
  await run('git add .')
  await run('git commit -m "Add nanoid"')
  await run('echo "# Test" > README.md')

  assert.equal(await cliGood('--text', '--changed'), 'No changes found\n')
  await cliJsonMatch([], '--json')
})

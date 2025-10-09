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
  runCli,
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

test('exits with error on missed port', async () => {
  // @ts-expect-error We are testing invalid argument
  assert.match(await cliBad('--port'), /requires a port number/)
  // @ts-expect-error We are testing invalid argument
  assert.match(await cliBad('--port good'), /requires a port number/)
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
    'diff --git a/package.json b/package.json\n' +
      'index 351777b..032de3b 100644\n' +
      '--- a/package.json\n' +
      '+++ b/package.json\n' +
      '@@ -1,6 +1,6 @@\n' +
      ' {\n' +
      '   "name": "nanoid",\n' +
      '-  "version": "5.1.4",\n' +
      '+  "version": "5.1.5",\n' +
      '   "description": "A tiny (118 bytes), secure URL-friendly unique string ID generator",\n' +
      '   "keywords": [\n' +
      '     "uuid",\n\n'
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

test('shows debug information with --debug', async () => {
  await startProject()
  let { code, stderr } = await runCli('--debug', '--text')
  assert.equal(code, 0)
  assert.match(stderr, /Multiocular version: v\d+\.\d+\.\d+/)
})

test('exits with error when --storage has no value', async () => {
  // @ts-expect-error We are testing invalid argument
  let result = await runCli('--storage')
  assert.notEqual(result.code, 0)
  assert.match(result.stderr, /--storage requires a folder path/)
})

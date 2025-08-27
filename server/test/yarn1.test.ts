import { afterEach, beforeEach, test } from 'node:test'

import {
  cliJsonEqual,
  cliJsonMatch,
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

test('shows dependency changes with yarn 1', async () => {
  await run('npm install yarn')
  await run('npx yarn add nanoid@5.1.4')
  await run('git add .')
  await run('git commit -m "Add nanoid"')
  await run('npx yarn add nanoid@5.1.5')

  await cliJsonEqual([
    {
      after: '5.1.5',
      before: '5.1.4',
      diff:
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
        '     "uuid",',
      from: 'yarn',
      name: 'nanoid',
      type: 'npm'
    }
  ])
})

test('shows scoped dependency changes with yarn 1', async () => {
  await run('npm install yarn')
  await run('npx yarn add @types/node@20.0.0')
  await run('git add .')
  await run('git commit -m "Add types node"')
  await run('npx yarn add @types/node@20.1.0')
  await cliJsonMatch([
    {
      after: '20.1.0',
      before: '20.0.0',
      name: '@types/node'
    }
  ])
})

test('shows git dependency changes with yarn 1', async () => {
  let beforeCommit = 'c0b7b0c33797d4397310bafe517d7e8b65bbf3cc'
  let afterCommit = '27ee2c4b80dc6ddf7916b6ec933f462945ddf3bc'

  await run('npm install yarn')
  await run(`npx yarn add nanoid@ai/nanoid#${beforeCommit}`)
  await run('git add .')
  await run('git commit -m "Add nanoid from git"')
  await run(`npx yarn add nanoid@ai/nanoid#${afterCommit}`)

  await cliJsonMatch([
    {
      after: new RegExp(afterCommit),
      before: new RegExp(beforeCommit),
      name: 'nanoid',
      type: 'npm'
    }
  ])
})

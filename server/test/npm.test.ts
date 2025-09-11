import { afterEach, beforeEach, test } from 'node:test'

import { UpdateType } from '../index.ts'
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

test('shows dependency changes with npm', async () => {
  await run('npm install postcss@8.4.31 nanoid@5.1.4')
  await run('git add .')
  await run('git commit -m "Add postcss and nanoid"')
  await run('npm install nanoid@5.1.5')

  await cliJsonEqual([
    {
      after: '5.1.5',
      before: '5.1.4',
      changelog: [
        ['5.1.5', '* Fixed latest version on npm after 3.x release.']
      ],
      diff:
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
        '     "uuid",\n',
      direct: true,
      from: 'npm',
      name: 'nanoid',
      repository: 'https://github.com/ai/nanoid',
      type: 'npm',
      update: UpdateType.PATCH
    }
  ])
})

test('shows scoped dependency changes with npm', async () => {
  await run('npm install @types/node@20.0.0')
  await run('git add .')
  await run('git commit -m "Add types node"')
  await run('npm install @types/node@20.1.0')
  await cliJsonMatch([
    {
      after: '20.1.0',
      before: '20.0.0',
      name: '@types/node'
    }
  ])
})

test('shows git dependency changes with npm', async () => {
  let beforeCommit = 'c0b7b0c33797d4397310bafe517d7e8b65bbf3cc'
  let afterCommit = '27ee2c4b80dc6ddf7916b6ec933f462945ddf3bc'

  await run(`npm install nanoid@ai/nanoid#${beforeCommit}`)
  await run('git add .')
  await run('git commit -m "Add nanoid from git"')
  await run(`npm install nanoid@ai/nanoid#${afterCommit}`)

  await cliJsonMatch([
    {
      after: new RegExp(afterCommit),
      before: new RegExp(beforeCommit),
      name: 'nanoid',
      repository: 'https://github.com/ai/nanoid',
      type: 'npm'
    }
  ])
})

test('shows nested dependency updates in npm', async () => {
  // Force nested nanoid version
  await run('npm install nanoid@3.3.4')
  await run('npm install postcss@8.4.20')
  await run('npm dedupe')
  await run('npm uninstall nanoid')

  await run('git add .')
  await run('git commit -m "Install PostCSS with Nano ID"')

  await run('npm install nanoid@3.3.5')
  await run('npm uninstall nanoid')

  await cliJsonMatch([
    {
      after: '3.3.5',
      before: '3.3.4',
      name: 'nanoid'
    }
  ])
})

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

test('shows dependency changes with yarn berry', async () => {
  await run('npm install yarn')
  await run('npx yarn init -2')
  await run('npx yarn add nanoid@5.1.4')
  await run('git add .')
  await run('git commit -m "Add nanoid"')
  await run('npx yarn add nanoid@5.1.5')

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
      from: 'yarn',
      name: 'nanoid',
      repository: 'https://github.com/ai/nanoid',
      type: 'npm'
    }
  ])
})

test('shows scoped dependency changes with yarn berry', async () => {
  await run('npm install yarn')
  await run('npx yarn init -2')
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

// No Yarn Berry git dependency test until this issue will be fixed
// https://github.com/yarnpkg/berry/issues/3169

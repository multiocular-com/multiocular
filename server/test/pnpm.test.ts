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

test('shows dependency changes with pnpm', async () => {
  await run('pnpm add nanoid@5.1.4')
  await run('git add .')
  await run('git commit -m "Add nanoid"')
  await run('pnpm add nanoid@5.1.5')
  await run('rm -r ./node_modules/nanoid/node_modules/.bin')

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
      from: 'pnpm',
      name: 'nanoid',
      repository: 'https://github.com/ai/nanoid',
      type: 'npm'
    }
  ])
})

test('shows scoped dependency changes with pnpm', async () => {
  await run('pnpm add @types/node@20.0.0')
  await run('git add .')
  await run('git commit -m "Add types node"')
  await run('pnpm add @types/node@20.1.0')
  await cliJsonMatch([
    {
      after: '20.1.0',
      before: '20.0.0',
      name: '@types/node',
      repository: 'https://github.com/DefinitelyTyped/DefinitelyTyped'
    }
  ])
})

test('shows nested dependency updates in pnpm', async () => {
  // Force nested nanoid version
  await run('pnpm add nanoid@3.3.4')
  await run('pnpm add postcss@8.4.20')
  await run('pnpm dedupe')
  await run('pnpm remove nanoid')

  await run('git add .')
  await run('git commit -m "Install PostCSS with Nano ID"')

  await run('pnpm add nanoid@3.3.5')
  await run('pnpm remove nanoid')

  await cliJsonMatch([
    {
      after: '3.3.5',
      before: '3.3.4',
      name: 'nanoid'
    }
  ])
})

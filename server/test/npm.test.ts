import { afterEach, beforeEach, test } from 'node:test'

import {
  cliJsonEqual,
  cliJsonMatch,
  removeProject,
  run,
  startProject,
  writeProjectFile
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
      from: 'pnpm',
      name: 'nanoid',
      type: 'npm'
    }
  ])
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
      from: 'npm',
      name: 'nanoid',
      type: 'npm'
    }
  ])
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

test('shows new dependency', async () => {
  await run('pnpm add nanoid@5.1.5')
  await cliJsonMatch([
    {
      before: false,
      diff: /"name": "nanoid"/,
      name: 'nanoid'
    }
  ])
})

test('handles deleted lockfile after adding dependency', async () => {
  await run('pnpm add nanoid@5.1.4')
  await run('git add .')
  await run('git commit -m "Add nanoid"')
  await run('rm pnpm-lock.yaml')
  await cliJsonEqual([])
})

test('supports separated major updates', async () => {
  await writeProjectFile('project-a/package.json', {
    name: 'project-a',
    private: true
  })
  await writeProjectFile('project-b/package.json', {
    name: 'project-b',
    private: true
  })
  await writeProjectFile('pnpm-workspace.yaml', 'packages:\n  - "project-*"\n')

  await run('pnpm add nanoid@5.1.4 --filter project-a')
  await run('pnpm add nanoid@4.0.0 --filter project-b')
  await run('git add .')
  await run('git commit -m "Add different nanoid versions"')

  await run('pnpm add nanoid@5.1.5 --filter project-a')
  await run('pnpm add nanoid@4.0.1 --filter project-b')

  await cliJsonMatch([
    {
      after: '4.0.1',
      before: '4.0.0',
      name: 'nanoid'
    },
    {
      after: '5.1.5',
      before: '5.1.4',
      name: 'nanoid'
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
      name: '@types/node'
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

test('shows git dependency changes with pnpm', async () => {
  let beforeCommit = 'c0b7b0c33797d4397310bafe517d7e8b65bbf3cc'
  let afterCommit = '27ee2c4b80dc6ddf7916b6ec933f462945ddf3bc'

  await run(`pnpm add nanoid@ai/nanoid#${beforeCommit}`)
  await run('git add .')
  await run('git commit -m "Add nanoid from git"')
  await run(`pnpm add nanoid@ai/nanoid#${afterCommit}`)

  await cliJsonMatch([
    {
      after: new RegExp(afterCommit),
      before: new RegExp(beforeCommit),
      name: 'nanoid',
      type: 'npm'
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
      type: 'npm'
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

// No Yarn Berry git dependency test until this issue will be fixed
// https://github.com/yarnpkg/berry/issues/3169

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

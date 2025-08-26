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
      name: 'nanoid',
      type: 'npm'
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

test('shows dependency changes in pnpm monorepo with different nanoid versions', async () => {
  //TODO: we should show 4.0.0→4.0.1 and 5.1.4→5.1.5 separately.
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
      before: '5.1.4',
      name: 'nanoid'
    },
    {
      after: '5.1.5',
      before: '5.1.4',
      name: 'nanoid'
    }
  ])
})

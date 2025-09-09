import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'

import { normalizeVersion } from '../index.ts'
import { cliJsonMatch, removeProject, run, startProject } from './utils.ts'

beforeEach(async () => {
  await startProject()
})

afterEach(async () => {
  await removeProject()
})

test('loads from CHANGELOG.md of npm', async () => {
  await run('pnpm add @csstools/color-helpers@5.0.2')
  await run('git add .')
  await run('git commit -m "Add @csstools/color-helpers"')
  await run('pnpm add @csstools/color-helpers@5.1.0')
  await cliJsonMatch([
    {
      after: '5.1.0',
      before: '5.0.2',
      changelog: [['5.1.0', /lin_P3_to_XYZ_D50/]],
      name: '@csstools/color-helpers'
    }
  ])
})

test('loads from CHANGELOG.md of GitHub', async () => {
  await run('pnpm add nanoid@5.1.1')
  await run('git add .')
  await run('git commit -m "Add @csstools/color-helpers"')
  await run('pnpm add nanoid@5.1.3')
  await cliJsonMatch([
    {
      after: '5.1.3',
      before: '5.1.1',
      changelog: [
        ['5.1.3', /React Native/],
        ['5.1.2', /Fixed module docs/]
      ],
      name: 'nanoid'
    }
  ])
})

test('loads from GitHub Releases', async () => {
  await run('pnpm add @lukeed/uuid@2.0.0')
  await run('git add .')
  await run('git commit -m "Add @lukeed/uuid"')
  await run('pnpm add @lukeed/uuid@2.0.1')
  await cliJsonMatch([
    {
      after: '2.0.1',
      before: '2.0.0',
      changelog: [['2.0.1', /Chrome v85/]],
      name: '@lukeed/uuid'
    }
  ])
})

test('normalizes versions in changelog', () => {
  assert.equal(normalizeVersion('1.0.0'), '1.0.0')
  assert.equal(normalizeVersion('1.0.0-beta'), '1.0.0-beta')
  assert.equal(normalizeVersion('v1.0.0-beta'), '1.0.0-beta')
  assert.equal(normalizeVersion('package@1.0.0-beta'), '1.0.0-beta')
  assert.equal(normalizeVersion('1.0.0 “Supername”'), '1.0.0')
})

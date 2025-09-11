import { strict as assert } from 'node:assert'
import { test } from 'node:test'

import { $changes, $progress, $sortedChanges } from '../../common/stores.ts'
import type { Change } from '../../common/stores.ts'
import { changeType } from '../../common/types.ts'
import type { Debrand } from '../../common/types.ts'

function mockChange(partial: Partial<Debrand<Change>>): Change {
  return changeType({
    after: '2.0.0',
    before: '1.0.0',
    from: 'npm',
    id: 'mock-change',
    name: 'mock-package',
    size: 100,
    status: 'loaded',
    type: 'npm',
    ...partial
  })
}

function setMockChanges(...partials: Partial<Debrand<Change>>[]): void {
  let changes = partials.map(partial => mockChange(partial))
  $changes.set(changes)
}

function ids(array: { id: string }[]): string[] {
  return array.map(item => item.id)
}

function createMockChanges(
  ...sizes: (number | undefined)[]
): Partial<Debrand<Change>>[] {
  return sizes.map((size, index) => {
    let id = `change${index + 1}`
    return {
      id,
      name: `package-${id}`,
      size,
      status: size === undefined ? 'loading' : 'loaded'
    }
  })
}

test('sorts changes', () => {
  // Empty changes
  $changes.set([])
  assert.deepEqual($sortedChanges.get(), [])

  // Mixed loading and loaded changes - loaded should come first
  setMockChanges(...createMockChanges(undefined, 500, undefined))
  assert.deepEqual(ids($sortedChanges.get()), ['change2', 'change1', 'change3'])

  // Multiple statuses with alphabetical sorting within each group
  setMockChanges(
    {
      id: 'z-package',
      name: 'z-package',
      size: 200,
      status: 'loaded'
    },
    {
      id: 'a-package',
      name: 'a-package',
      size: 100,
      status: 'loaded'
    },
    {
      id: 'm-package',
      name: 'm-package',
      status: 'loading'
    },
    {
      id: 'b-package',
      name: 'b-package',
      status: 'loading'
    }
  )

  assert.deepEqual(ids($sortedChanges.get()), [
    'a-package',
    'z-package',
    'b-package',
    'm-package'
  ])
})

test('calculates progress', () => {
  // Empty changes
  $changes.set([])
  assert.deepEqual($progress.get(), [])

  // Single loading change
  setMockChanges(...createMockChanges(undefined))
  assert.deepEqual($progress.get(), [
    { id: 'loading', part: 100, status: 'loading' }
  ])

  // Single loaded change
  setMockChanges(...createMockChanges(100))
  assert.deepEqual($progress.get(), [
    { id: 'change1', part: 100, status: 'loaded' }
  ])

  // Multiple loaded changes
  setMockChanges(...createMockChanges(300, 700))
  assert.deepEqual($progress.get(), [
    { id: 'change1', part: 30, status: 'loaded' },
    { id: 'change2', part: 70, status: 'loaded' }
  ])

  // Mixed loading and loaded changes (loaded comes first due to sorting)
  setMockChanges(...createMockChanges(undefined, 500, undefined))
  assert.deepEqual($progress.get(), [
    { id: 'change2', part: 33.33333333333334, status: 'loaded' },
    { id: 'loading', part: 66.66666666666666, status: 'loading' }
  ])

  // Multiple loading changes
  setMockChanges(...createMockChanges(undefined, undefined, undefined))
  assert.deepEqual($progress.get(), [
    { id: 'loading', part: 100, status: 'loading' }
  ])

  // Zero total size loaded changes
  setMockChanges(...createMockChanges(0, 0))
  assert.deepEqual($progress.get(), [
    { id: 'change1', part: 50, status: 'loaded' },
    { id: 'change2', part: 50, status: 'loaded' }
  ])
})

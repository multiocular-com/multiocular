import { computed, type ReadableAtom } from 'nanostores'

import { $changes, type Change } from '../../common/stores.ts'
import type { ChangeId } from '../../common/types.ts'

export function getChange(id: ChangeId): ReadableAtom<Change> {
  return computed([$changes], changes => {
    let value = changes.find(i => i.id === id)
    if (value) {
      return { ...value, isLoading: false, notFound: false } as const
    } else {
      throw new Error('No change with this ID')
    }
  })
}

export function getChangeIndex(
  changes: readonly Change[],
  id: ChangeId
): string {
  return `${changes.findIndex(i => i.id === id) + 1}` + `/${changes.length}`
}

export function getNextChange(
  changes: readonly Change[],
  id: ChangeId
): Change | undefined {
  return changes[changes.findIndex(i => i.id === id) + 1]
}

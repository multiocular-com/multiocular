import { computed, type ReadableAtom } from 'nanostores'

import { $changes, $step, type Change } from '../../common/stores.ts'
import type { ChangeId } from '../../common/types.ts'

export type ChangeValue =
  | ({ isLoading: false; notFound: false } & Change)
  | { isLoading: false; notFound: true }
  | { isLoading: true; notFound: false }

export function getChange(id: ChangeId): ReadableAtom<ChangeValue> {
  return computed([$changes, $step], (changes, step) => {
    let value = changes.find(i => i.id === id)
    if (value) {
      return { ...value, isLoading: false, notFound: false } as const
    } else if (step === 'initialize' || step === 'versions') {
      return { isLoading: true, notFound: false } as const
    } else {
      return { isLoading: false, notFound: true } as const
    }
  })
}

export function getChangeIndex(
  changes: readonly Change[],
  id: ChangeId
): string {
  return `${changes.findIndex(i => i.id === id) + 1}` + `/${changes.length}`
}

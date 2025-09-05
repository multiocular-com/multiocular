import { computed, type ReadableAtom } from 'nanostores'

import { $diffs } from '../../common/stores.ts'
import type { ChangeId, Diff } from '../../common/types.ts'

export type DiffValue = { isLoading: false; value: Diff } | { isLoading: true }

export function getDiff(id: ChangeId): ReadableAtom<DiffValue> {
  return computed([$diffs], diffs => {
    let value = diffs[id]
    if (value) {
      return { isLoading: false, value } as const
    } else {
      return { isLoading: true } as const
    }
  })
}

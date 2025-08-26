import { atom, computed } from 'nanostores'

import type { ChangeDiff, ChangeId, Diff, DiffSize } from '../types.ts'

export type ChangeStatus = {
  id: ChangeId
} & ({ size: DiffSize; status: 'loaded' } | { status: 'loading' })

export const $step = atom<'diffs' | 'done' | 'versions'>('versions')

export const $loading = atom<ChangeStatus[]>([])

export const $diffs = atom<ChangeDiff[]>([])

export const $sortedDiffs = computed($diffs, diffs =>
  [...diffs].sort((a, b) => a.id.localeCompare(b.id))
)

function changeStatus(changed: ChangeStatus): void {
  $loading.set(
    $loading.get().map(i => {
      if (i.id === changed.id) {
        return changed
      } else {
        return i
      }
    })
  )
}

function realLines(str: string): number {
  return str.split('\n').filter(i => i.trim().length > 0).length
}

export function calcSize(diff: Diff): DiffSize {
  return realLines(diff) as DiffSize
}

export function addDiff(diff: ChangeDiff): void {
  changeStatus({ id: diff.id, size: calcSize(diff.diff), status: 'loaded' })
  $diffs.set([...$diffs.get(), diff])
}

export function declareUnloadedChanges(ids: ChangeId[]): void {
  $loading.set(ids.map(id => ({ id, status: 'loading' })))
}

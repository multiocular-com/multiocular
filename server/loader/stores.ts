import { $changes, type Change } from '../../common/stores.ts'
import type { ChangeId, Diff, DiffSize } from '../../common/types.ts'

function changeStatus(changeId: ChangeId, update: Partial<Change>): void {
  $changes.set(
    $changes.get().map(change => {
      if (change.id === changeId) {
        return { ...change, ...update } as Change
      } else {
        return change
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

export function addDiff(changeId: ChangeId, diff: Diff): void {
  changeStatus(changeId, {
    diff,
    size: calcSize(diff),
    status: 'loaded'
  })
}

export function initChanges(changes: Change[]): void {
  $changes.set(changes)
}

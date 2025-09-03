import {
  $changes,
  $diffs,
  type Change,
  updateChangeById
} from '../../common/stores.ts'
import type { ChangeId, Diff, DiffSize } from '../../common/types.ts'
import { sendReplaceChanges, sendUpdateChange } from '../web/sync.ts'

export function updateChangeAndSend(
  id: ChangeId,
  update: Partial<Change>
): void {
  updateChangeById(id, update)
  sendUpdateChange(id, update)
}

function realLines(str: string): number {
  return str.split('\n').filter(i => i.trim().length > 0).length
}

export function calcSize(diff: Diff): DiffSize {
  return realLines(diff) as DiffSize
}

export function addDiff(changeId: ChangeId, diff: Diff): void {
  $diffs.set({ ...$diffs.get(), [changeId]: diff })
  updateChangeAndSend(changeId, {
    size: calcSize(diff),
    status: 'loaded'
  })
}

export function initChanges(changes: Change[]): void {
  $changes.set(changes)
  sendReplaceChanges(changes)
}

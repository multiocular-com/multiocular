import { atom, computed } from 'nanostores'

import type {
  ChangeId,
  Dependency,
  DependencyName,
  DependencyVersion,
  Diff,
  DiffSize
} from './types.ts'

export type StepValue = 'diffs' | 'done' | 'initialize' | 'versions'

export const $step = atom<StepValue>('initialize')

export type Change = {
  after: DependencyVersion
  before: DependencyVersion | false
  from: Dependency['from']
  id: ChangeId
  name: DependencyName
  type: Dependency['type']
} & (
  | {
      size: DiffSize
      status: 'loaded'
    }
  | {
      status: 'loading'
    }
)

export type ChangeDiffs = Record<ChangeId, Diff>

export const $changes = atom<Change[]>([])

export const $diffs = atom<ChangeDiffs>({})

export const $sortedChanges = computed($changes, changes =>
  [...changes].sort((a, b) => a.id.localeCompare(b.id))
)

export function updateChangeById(id: ChangeId, update: Partial<Change>): void {
  $changes.set(
    $changes.get().map(change => {
      if (change.id === id) {
        return { ...change, ...update } as Change
      } else {
        return change
      }
    })
  )
}

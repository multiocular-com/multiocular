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
      diff: Diff
      size: DiffSize
      status: 'loaded'
    }
  | {
      status: 'loading'
    }
)

export const $changes = atom<Change[]>([])

export const $sortedChanges = computed($changes, changes =>
  [...changes].sort((a, b) => a.id.localeCompare(b.id))
)

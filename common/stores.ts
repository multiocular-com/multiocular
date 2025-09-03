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

export type ChangeStatus = {
  id: ChangeId
} & ({ size: DiffSize; status: 'loaded' } | { status: 'loading' })

export const $loading = atom<ChangeStatus[]>([])

export interface Change {
  after: DependencyVersion
  before: DependencyVersion | false
  from: Dependency['from']
  id: ChangeId
  name: DependencyName
  type: Dependency['type']
}

export type ChangeDiff = {
  diff: Diff
} & Change

export const $diffs = atom<ChangeDiff[]>([])

export const $sortedDiffs = computed($diffs, diffs =>
  [...diffs].sort((a, b) => a.id.localeCompare(b.id))
)

import { atom, computed } from 'nanostores'

import type { ChangeDiff, ChangeStatus } from './types.ts'

export type StepValue = 'diffs' | 'done' | 'initialize' | 'versions'

export const $step = atom<StepValue>('initialize')

export const $loading = atom<ChangeStatus[]>([])

export const $diffs = atom<ChangeDiff[]>([])

export const $sortedDiffs = computed($diffs, diffs =>
  [...diffs].sort((a, b) => a.id.localeCompare(b.id))
)

import { defineAction } from '@logux/actions'

import type { Change, StepValue } from './stores.ts'
import type { ChangeId, Diff } from './types.ts'

export const subprotocol = 0

export const changeStepAction = defineAction<{
  type: 'step/change'
  value: StepValue
}>('step/change')

export const replaceChangesAction = defineAction<{
  changes: Change[]
  type: 'changes/replace'
}>('changes/replace')

export const updateChangeAction = defineAction<{
  id: ChangeId
  type: 'changes/update'
  update: Partial<Change>
}>('changes/update')

export const addDiffAction = defineAction<{
  diff: Diff
  id: ChangeId
  type: 'diffs/add'
}>('diffs/add')

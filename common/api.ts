import { defineAction } from '@logux/actions'

import type { Change, StepValue } from './stores.ts'
import type { ChangeId } from './types.ts'

export const subprotocol = 0

export const changeStep = defineAction<{
  type: 'step/change'
  value: StepValue
}>('step/change')

export const replaceChanges = defineAction<{
  changes: Change[]
  type: 'changes/replace'
}>('changes/replace')

export const updateChange = defineAction<{
  id: ChangeId
  type: 'changes/update'
  update: Partial<Change>
}>('changes/update')

import { defineAction } from '@logux/actions'

import type { Change, ChangeLogHtml, FileDiffs, StepValue } from './stores.ts'
import type { ChangeId } from './types.ts'

export const subprotocol = 0

export const changeStepAction = defineAction<{
  type: 'step/change'
  value: StepValue
}>('step/change')

export const replaceChangesAction = defineAction<{
  changes: Change[]
  type: 'changes/replace'
}>('changes/replace')

export const reviewChangeAction = defineAction<{
  id: ChangeId
  type: 'changes/review'
  value: Exclude<Change['status'], 'loading'>
}>('changes/review')

export const updateChangeAction = defineAction<{
  id: ChangeId
  type: 'changes/update'
  update: Partial<Change>
}>('changes/update')

export const addFileDiffsAction = defineAction<{
  fileDiffs: FileDiffs
  id: ChangeId
  type: 'file-diffs/add'
}>('file-diffs/add')

export const addChangelogHtmlAction = defineAction<{
  changelog: ChangeLogHtml
  id: ChangeId
  type: 'changelog-htmls/add'
}>('changelog-htmls/add')

import { defineAction } from '@logux/actions'

import type { StepValue } from './types.ts'

export const subprotocol = 0

export const changeStep = defineAction<{
  type: 'step/change'
  value: StepValue
}>('step/change')

import { loguxSubscribe } from '@logux/actions'
import { CrossTabClient } from '@logux/client'

import {
  changeStep,
  replaceChanges,
  subprotocol,
  updateChange as updateChangeAction
} from '../../common/api.ts'
import { $changes, $step, updateChangeById } from '../../common/stores.ts'

export const client = new CrossTabClient({
  server: __SERVER_URL__,
  subprotocol,
  userId: 'reviewer'
})

client.log.add(loguxSubscribe({ channel: 'projects/main' }), { sync: true })

client.log.on('add', action => {
  if (changeStep.match(action)) {
    $step.set(action.value)
  } else if (replaceChanges.match(action)) {
    $changes.set(action.changes)
  } else if (updateChangeAction.match(action)) {
    updateChangeById(action.id, action.update)
  }
})

client.start()

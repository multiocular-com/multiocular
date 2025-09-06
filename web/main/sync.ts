import { loguxSubscribe } from '@logux/actions'
import { CrossTabClient } from '@logux/client'

import {
  addDiffAction,
  changeStepAction,
  replaceChangesAction,
  reviewChangeAction,
  subprotocol,
  updateChangeAction
} from '../../common/api.ts'
import { $changes, $step, addDiff, updateChange } from '../../common/stores.ts'

let server = __SERVER_URL__

if (server === '') {
  server =
    (location.protocol === 'https:' ? 'wss:' : 'ws:') +
    '//' +
    location.host +
    '/'
}

export const client = new CrossTabClient({
  server,
  subprotocol,
  userId: 'reviewer'
})

client.log.add(loguxSubscribe({ channel: 'projects/main' }), { sync: true })

client.log.on('add', action => {
  if (changeStepAction.match(action)) {
    $step.set(action.value)
  } else if (replaceChangesAction.match(action)) {
    $changes.set(action.changes)
  } else if (updateChangeAction.match(action)) {
    updateChange(action.id, action.update)
  } else if (reviewChangeAction.match(action)) {
    updateChange(action.id, { status: action.value })
  } else if (addDiffAction.match(action)) {
    addDiff(action.id, action.diff)
  }
})

client.start()

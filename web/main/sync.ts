import { loguxSubscribe } from '@logux/actions'
import { CrossTabClient, log } from '@logux/client'

import {
  addChangelogAction,
  addDiffAction,
  changeStepAction,
  replaceChangesAction,
  reviewChangeAction,
  subprotocol,
  updateChangeAction
} from '../../common/api.ts'
import {
  $changes,
  $step,
  addToChangelogs,
  addToDiffs,
  updateChange
} from '../../common/stores.ts'

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

if (import.meta.env.DEV) log(client)

client.log.add(loguxSubscribe({ channel: 'projects/main' }), { sync: true })

client.on('add', action => {
  if (changeStepAction.match(action)) {
    $step.set(action.value)
  } else if (replaceChangesAction.match(action)) {
    $changes.set(action.changes)
  } else if (updateChangeAction.match(action)) {
    updateChange(action.id, action.update)
  } else if (reviewChangeAction.match(action)) {
    updateChange(action.id, { status: action.value })
  } else if (addDiffAction.match(action)) {
    addToDiffs(action.id, action.diff)
  } else if (addChangelogAction.match(action)) {
    addToChangelogs(action.id, action.changelog)
  }
})

client.start()

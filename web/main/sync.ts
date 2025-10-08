import { loguxSubscribe } from '@logux/actions'
import { CrossTabClient, log } from '@logux/client'

import {
  addChangelogHtmlAction,
  addFileDiffsAction,
  changeStepAction,
  replaceChangesAction,
  reviewChangeAction,
  subprotocol,
  updateChangeAction
} from '../../common/api.ts'
import {
  $changelogHtmls,
  $changes,
  $fileDiffs,
  $step,
  updateChange,
  updateChangeStatus
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

client.on('add', (action, meta) => {
  if (changeStepAction.match(action)) {
    $step.set(action.value)
  } else if (replaceChangesAction.match(action)) {
    $changes.set(action.changes)
  } else if (updateChangeAction.match(action)) {
    updateChange(action.id, action.update)
  } else if (reviewChangeAction.match(action)) {
    updateChangeStatus(action.id, action.value, meta.time)
  } else if (addFileDiffsAction.match(action)) {
    $fileDiffs.setKey(action.id, action.fileDiffs)
  } else if (addChangelogHtmlAction.match(action)) {
    $changelogHtmls.setKey(action.id, action.changelog)
  }
})

if (__SERVER_URL__ !== 'offline') {
  client.start()
}

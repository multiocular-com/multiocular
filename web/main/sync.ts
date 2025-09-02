import { loguxSubscribe } from '@logux/actions'
import { CrossTabClient } from '@logux/client'

import { changeStep, subprotocol } from '../../common/api.ts'
import { $step } from '../../common/stores.ts'

export const client = new CrossTabClient({
  server: __SERVER_URL__,
  subprotocol,
  userId: 'reviewer'
})

client.log.add(loguxSubscribe({ channel: 'projects/main' }), { sync: true })

client.log.on('add', action => {
  if (changeStep.match(action)) {
    $step.set(action.value)
  }
})

client.start()

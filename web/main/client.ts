import { CrossTabClient } from '@logux/client'

import { subprotocol } from '../../common/api.ts'

export const client = new CrossTabClient({
  server: 'ws://localhost:31337',
  subprotocol,
  userId: 'reviewer'
})

client.start()

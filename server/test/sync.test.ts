import { loguxProcessed, loguxSubscribe } from '@logux/actions'
import { TestServer } from '@logux/server'
import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import { setTimeout } from 'node:timers/promises'

import { changeStep } from '../../common/api.ts'
import { $step } from '../index.ts'
import { syncStores } from '../web/sync.ts'

let server: TestServer

beforeEach(() => {
  server = new TestServer()
  syncStores(server)
})

afterEach(async () => {
  await server.destroy()
})

test('syncs step', async () => {
  let client = await server.connect('reviewer')
  assert.deepEqual(
    await client.received(async () => {
      $step.set('versions')
      await setTimeout(10)
    }),
    []
  )
  assert.deepEqual(
    await client.received(async () => {
      await client.process(loguxSubscribe({ channel: 'projects/main' }))
    }),
    [
      changeStep({ value: 'versions' }),
      loguxProcessed({ id: '2 reviewer:1:1 0' })
    ]
  )

  assert.deepEqual(
    await client.received(async () => {
      $step.set('done')
      await setTimeout(10)
    }),
    [changeStep({ value: 'done' })]
  )
})

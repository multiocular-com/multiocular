import { loguxProcessed, loguxSubscribe } from '@logux/actions'
import { TestServer } from '@logux/server'
import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import { setTimeout } from 'node:timers/promises'

import { changeStep, replaceChanges, updateChange } from '../../common/api.ts'
import { change, type ChangeId, diff } from '../../common/types.ts'
import { $changes, $step } from '../index.ts'
import { addDiff } from '../loader/stores.ts'
import { syncStores } from '../web/sync.ts'

let server: TestServer

beforeEach(() => {
  server = new TestServer()
  syncStores(server)
  $changes.set([])
  $step.set('initialize')
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
      replaceChanges({ changes: [] }),
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

test('syncs subscription and change update', async () => {
  let client = await server.connect('reviewer')

  assert.deepEqual(
    await client.received(async () => {
      await client.process(loguxSubscribe({ channel: 'projects/main' }))
    }),
    [
      changeStep({ value: 'initialize' }),
      replaceChanges({ changes: [] }),
      loguxProcessed({ id: '2 reviewer:1:1 0' })
    ]
  )

  $changes.set([
    change({
      after: '2.0.0',
      before: '1.0.0',
      from: 'npm',
      id: 'test-change',
      name: 'test-package',
      repository: 'https://www.npmjs.com/package/test-package',
      status: 'loading',
      type: 'npm'
    })
  ])

  assert.deepEqual(
    await client.received(async () => {
      addDiff('test-change' as ChangeId, diff('diff'))
      await setTimeout(10)
    }),
    [
      updateChange({
        id: 'test-change' as ChangeId,
        update: change({
          size: 1,
          status: 'loaded'
        })
      })
    ]
  )
})

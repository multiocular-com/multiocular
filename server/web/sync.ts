import type { BaseServer } from '@logux/server'

import { changeStep, replaceChanges, updateChange } from '../../common/api.ts'
import { $changes, $step, type Change } from '../../common/stores.ts'
import type { ChangeId } from '../../common/types.ts'
import { LOCAL } from '../env.ts'

let syncServer: BaseServer | null = null

export function sendUpdateChange(id: ChangeId, update: Partial<Change>): void {
  if (syncServer) {
    syncServer.process(updateChange({ id, update }))
  }
}

export function sendReplaceChanges(changes: Change[]): void {
  if (syncServer) {
    syncServer.process(replaceChanges({ changes }))
  }
}

export function syncStores(server: BaseServer): void {
  syncServer = server

  server.channel('projects/main', {
    access() {
      return LOCAL
    },
    load() {
      return [
        changeStep({ value: $step.get() }),
        replaceChanges({ changes: $changes.get() })
      ]
    }
  })

  server.type(changeStep, {
    access() {
      // Only server can send this action
      return false
    },
    resend() {
      return 'projects/main'
    }
  })

  server.type(replaceChanges, {
    access() {
      // Only server can send this action
      return false
    },
    resend() {
      return 'projects/main'
    }
  })

  server.type(updateChange, {
    access() {
      // Only server can send this action
      return false
    },
    resend() {
      return 'projects/main'
    }
  })

  $step.listen(value => {
    server.process(changeStep({ value }))
  })
}

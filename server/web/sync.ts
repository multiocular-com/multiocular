import type { Action, BaseServer } from '@logux/server'

import {
  addChangelogHtmlAction,
  addFileDiffsAction,
  changeStepAction,
  replaceChangesAction,
  reviewChangeAction,
  updateChangeAction
} from '../../common/api.ts'
import {
  $changelogHtmls,
  $changes,
  $fileDiffs,
  $step,
  updateChangeStatus
} from '../../common/stores.ts'
import type { ChangeId } from '../../common/types.ts'
import { LOCAL } from '../env.ts'

let syncServer: BaseServer | null = null

export function send(action: Action): void {
  syncServer?.process(action)
}

export function syncStores(server: BaseServer): void {
  syncServer = server

  server.channel('projects/main', {
    access() {
      return LOCAL
    },
    load() {
      return [
        changeStepAction({ value: $step.get() }),
        replaceChangesAction({ changes: $changes.get() }),
        ...Object.entries($fileDiffs.get()).map(([id, fileDiffs]) => {
          return addFileDiffsAction({ fileDiffs, id: id as ChangeId })
        }),
        ...Object.entries($changelogHtmls.get()).map(([id, changelog]) => {
          return addChangelogHtmlAction({ changelog, id: id as ChangeId })
        })
      ]
    }
  })

  server.type(changeStepAction, {
    access() {
      // Only server can send this action
      return false
    },
    resend() {
      return 'projects/main'
    }
  })

  server.type(replaceChangesAction, {
    access() {
      // Only server can send this action
      return false
    },
    resend() {
      return 'projects/main'
    }
  })

  server.type(updateChangeAction, {
    access() {
      // Only server can send this action
      return false
    },
    resend() {
      return 'projects/main'
    }
  })

  server.type(reviewChangeAction, {
    access() {
      return LOCAL
    },
    process(ctx, action, meta) {
      updateChangeStatus(action.id, action.value, meta.time)
    },
    resend() {
      return 'projects/main'
    }
  })

  server.type(addFileDiffsAction, {
    access() {
      // Only server can send this action
      return false
    },
    resend() {
      return 'projects/main'
    }
  })

  server.type(addChangelogHtmlAction, {
    access() {
      // Only server can send this action
      return false
    },
    resend() {
      return 'projects/main'
    }
  })

  $step.listen(value => {
    server.process(changeStepAction({ value }))
  })
}

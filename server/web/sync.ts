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
  onChangeUpdate,
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
        replaceChangesAction({ changes: $changes.get() })
      ]
    }
  })

  server.channel(/^changes\/(.*)$/, {
    access() {
      return LOCAL
    },
    load(ctx) {
      let actions: Action[] = []
      let id = ctx.params[1] as ChangeId
      let fileDiffs = $fileDiffs.get()[id]
      if (fileDiffs) actions.push(addFileDiffsAction({ fileDiffs, id }))
      let changelog = $changelogHtmls.get()[id]
      if (changelog) actions.push(addChangelogHtmlAction({ changelog, id }))
      return actions
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
    resend(ctx, action) {
      return `changes/${action.id}`
    }
  })

  server.type(addChangelogHtmlAction, {
    access() {
      // Only server can send this action
      return false
    },
    resend(ctx, action) {
      return `changes/${action.id}`
    }
  })

  $step.listen(value => {
    server.process(changeStepAction({ value }))
  })

  onChangeUpdate((id, update) => {
    server.process(updateChangeAction({ id, update }))
  })
}

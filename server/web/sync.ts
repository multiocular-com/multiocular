import type { Action, BaseServer } from '@logux/server'

import {
  addChangelogAction,
  addDiffAction,
  changeStepAction,
  replaceChangesAction,
  reviewChangeAction,
  updateChangeAction
} from '../../common/api.ts'
import {
  $changelogs,
  $changes,
  $diffs,
  $step,
  updateChange
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
        ...Object.entries($diffs.get()).map(([id, diff]) => {
          return addDiffAction({ diff, id: id as ChangeId })
        }),
        ...Object.entries($changelogs.get()).map(([id, changelog]) => {
          return addChangelogAction({ changelog, id: id as ChangeId })
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
    process(ctx, action) {
      updateChange(action.id, { status: action.value })
    },
    resend() {
      return 'projects/main'
    }
  })

  server.type(addDiffAction, {
    access() {
      // Only server can send this action
      return false
    },
    resend() {
      return 'projects/main'
    }
  })

  server.type(addChangelogAction, {
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

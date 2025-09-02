import type { BaseServer } from '@logux/server'

import { changeStep } from '../../common/api.ts'
import { $step } from '../../common/stores.ts'
import { LOCAL } from '../env.ts'

export function syncStores(server: BaseServer): void {
  server.channel('projects/main', {
    access() {
      return LOCAL
    },
    load() {
      return changeStep({ value: $step.get() })
    }
  })

  server.type(changeStep, {
    access() {
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

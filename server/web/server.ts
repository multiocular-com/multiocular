import { Server } from '@logux/server'

import type { Config } from '../cli/args.ts'
import { serveAssets } from './assets.ts'

export function startWebServerIfNecessary(config: Config): void {
  if (config.output === 'web') {
    let server = new Server({
      host: '0.0.0.0',
      subprotocol: '1.0.0',
      supports: '1.0.0'
    })
    server.auth(() => false)
    serveAssets(server)
    server.listen()
  }
}

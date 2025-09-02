import { Server } from '@logux/server'

import { subprotocol } from '../../common/api.ts'
import type { Config } from '../cli/args.ts'
import { printUrl } from '../cli/print.ts'
import { LOCAL } from '../env.ts'
import { serveAssets } from './assets.ts'
import { syncStores } from './sync.ts'

export function startWebServerIfNecessary(config: Config): void {
  if (config.output === 'web') {
    let server = new Server({
      host: '0.0.0.0',
      minSubprotocol: subprotocol,
      port: config.port,
      subprotocol
    })
    if (!config.debug) {
      server.logger.debug = () => {}
      server.logger.info = () => {}
      server.logger.warn = () => {}
    }
    server.auth(() => LOCAL)
    serveAssets(server)
    syncStores(server)

    server.listen().then(() => {
      printUrl(server.options.port as number)
    })
  }
}

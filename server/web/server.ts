import { Server } from '@logux/server'

import { subprotocol } from '../../common/api.ts'
import type { Config } from '../cli/args.ts'
import { LOCAL } from '../env.ts'
import { serveAssets } from './assets.ts'
import { syncStores } from './sync.ts'

export function startWebServerIfNecessary(config: Config): void {
  if (config.output === 'web') {
    let server = new Server({
      host: '0.0.0.0',
      minSubprotocol: subprotocol,
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
      process.stderr.write('Web server listening on port 31337\n')
    })
  }
}

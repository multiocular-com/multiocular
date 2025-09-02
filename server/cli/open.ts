import { exec } from 'node:child_process'
import { platform } from 'node:process'

import type { ServerURL } from '../../common/types.ts'

export function openBrowser(url: ServerURL): Promise<void> {
  return new Promise(resolve => {
    let command: string
    if (platform === 'darwin') {
      command = `open "${url}"`
    } else if (platform === 'win32') {
      command = `start "" "${url}"`
    } else if (platform === 'linux') {
      command = `xdg-open "${url}"`
    } else {
      return
    }

    exec(command, error => {
      if (error) {
        resolve()
      }
    })
  })
}

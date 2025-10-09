import { homedir } from 'node:os'
import { join } from 'node:path'

export function getUserFolder(): string {
  if (process.platform === 'win32') {
    return join(homedir(), 'AppData', 'Local', 'multiocular')
  } else if (process.platform === 'darwin') {
    return join(homedir(), 'Library', 'Application Support', 'multiocular')
  } else {
    return join(homedir(), '.local', 'share', 'multiocular')
  }
}

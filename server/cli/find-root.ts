import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

export function findProjectRoot(start: string): null | string {
  let current = resolve(start)
  let hasParent = true

  do {
    let git = resolve(current, '.git')
    if (existsSync(git)) return current

    let parent = dirname(current)
    hasParent = current !== parent
    current = parent
  } while (hasParent)

  return null
}

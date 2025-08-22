import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'

import type { FilePath } from '../../utils/types.js'

export function findProjectRoot(start: FilePath): FilePath | null {
  let current = start
  let hasParent = true

  do {
    let git = join(current, '.git') as FilePath
    if (existsSync(git)) return current

    let parent = dirname(current) as FilePath
    hasParent = current !== parent
    current = parent
  } while (hasParent)

  return null
}

import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'

import type { FilePath } from '../../utils/types.js'
import { format, printError } from '../cli/print.ts'

export function findProjectRoot(start: FilePath): FilePath {
  let current = start
  let hasParent = true

  do {
    let git = join(current, '.git') as FilePath
    if (existsSync(git)) return current

    let parent = dirname(current) as FilePath
    hasParent = current !== parent
    current = parent
  } while (hasParent)

  printError(
    format('Could not find project root directory containing a .git folder')
  )
  process.exit(1)
}

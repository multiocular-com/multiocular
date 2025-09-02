import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'

import { filePath, type FilePath } from '../../common/types.ts'
import { format, printError } from '../cli/print.ts'

export function findProjectRoot(start: FilePath): FilePath {
  let current = start
  let hasParent = true

  do {
    let git = filePath(join(current, '.git'))
    if (existsSync(git)) return current

    let parent = filePath(dirname(current))
    hasParent = current !== parent
    current = parent
  } while (hasParent)

  printError(
    format('Could not find project root directory containing a .git folder')
  )
  process.exit(1)
}

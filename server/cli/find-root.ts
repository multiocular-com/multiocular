import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'

import { type FilePath, filePathType } from '../../common/types.ts'
import { format, printError } from '../cli/print.ts'

export function findProjectRoot(start: FilePath): FilePath {
  let current = start
  let hasParent = true

  do {
    let git = filePathType(join(current, '.git'))
    if (existsSync(git)) return current

    let parent = filePathType(dirname(current))
    hasParent = current !== parent
    current = parent
  } while (hasParent)

  printError(
    format('Could not find project root directory containing a .git folder')
  )
  process.exit(1)
}

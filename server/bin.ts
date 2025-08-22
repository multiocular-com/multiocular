#!/usr/bin/env node

import { parseArgs } from './cli/args.ts'
import { format, printError } from './cli/print.ts'
import { type FilePath, findProjectRoot } from './index.ts'

const config = await parseArgs(process.argv.slice(2))

if (config.command === 'run') {
  let root = findProjectRoot(process.cwd() as FilePath)

  if (!root) {
    printError(
      format('Could not find project root directory containing a .git folder')
    )
    process.exit(1)
  }

  // start sync server
  // init storage
  // extract current versions
  // extract prev versions
  // find changes
  // extract diffs
}

#!/usr/bin/env node

import { parseArgs } from './cli/args.ts'
import { type FilePath, findProjectRoot } from './index.ts'

const config = await parseArgs(process.argv.slice(2))

if (config.command === 'run') {
  let root = findProjectRoot(process.cwd() as FilePath)
  process.stdout.write(root + '\n')

  // start sync server
  // init storage
  // extract current versions
  // extract prev versions
  // find changes
  // extract diffs
}

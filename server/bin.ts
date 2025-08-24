#!/usr/bin/env node

import { parseArgs } from './cli/args.ts'
import {
  type Argument,
  type FilePath,
  findProjectRoot,
  loadDiffs,
  outputProcess
} from './index.ts'

let config = await parseArgs(process.argv.slice(2) as Argument[])
let root = findProjectRoot(process.cwd() as FilePath)
loadDiffs(root, config)
outputProcess(config)

// TODO: start sync server
// TODO: init storage

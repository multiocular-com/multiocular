#!/usr/bin/env node

import { parseArgs } from './cli/args.ts'
import { filePath, findProjectRoot, loadDiffs, outputProcess } from './index.ts'

let config = await parseArgs(process.argv.slice(2))
let root = findProjectRoot(filePath(process.cwd()))
loadDiffs(root, config)
outputProcess(config)

// TODO: start sync server
// TODO: init storage

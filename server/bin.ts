#!/usr/bin/env node

import { parseArgs } from './cli/args.ts'
import {
  filePath,
  findProjectRoot,
  loadDiffs,
  outputProcess,
  printDebugInfo,
  startWebServerIfNecessary
} from './index.ts'

let config = await parseArgs(process.argv.slice(2))
let root = findProjectRoot(filePath(process.cwd()))
if (config.debug) await printDebugInfo(config, root)

loadDiffs(root, config)
outputProcess(config)
startWebServerIfNecessary(config)

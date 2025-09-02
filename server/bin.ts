#!/usr/bin/env node

import {
  filePath,
  findProjectRoot,
  getVersion,
  loadDiffs,
  openBrowser,
  outputProcess,
  parseArgs,
  printDebugInfo,
  startWebServerIfNecessary
} from './index.ts'

let config = await parseArgs(process.argv.slice(2))
let root = findProjectRoot(filePath(process.cwd()))
if (config.debug) printDebugInfo(await getVersion(), config, root)

loadDiffs(root, config)
outputProcess(config)
let url = await startWebServerIfNecessary(config)
if (url && !config.noOpen) openBrowser(url)

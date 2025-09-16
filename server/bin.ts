#!/usr/bin/env node

import {
  $step,
  deleteTemporary,
  filePathType,
  findProjectRoot,
  getVersion,
  loadDiffs,
  openBrowser,
  outputProcess,
  parseArgs,
  printDebugInfo,
  startWebServerIfNecessary
} from './index.ts'

process.on('SIGTERM', () => {
  deleteTemporary()
  process.exit(0)
})

try {
  let config = await parseArgs(process.argv.slice(2))
  let root = findProjectRoot(filePathType(process.cwd()))
  if (config.debug) printDebugInfo(getVersion(), config, root)

  loadDiffs(root, config)
  outputProcess(config)
  let url = await startWebServerIfNecessary(config)
  if (url && !config.noOpen) openBrowser(url)

  $step.subscribe(step => {
    if (step === 'done') deleteTemporary()
  })
} catch (e) {
  deleteTemporary()
  throw e
}

import { findProjectRoot } from './index.ts'

const root = findProjectRoot(process.cwd())

if (!root) {
  process.stderr.write(
    'Error: Could not find project root directory containing a VCS folder (.git, .hg, or .svn)\n'
  )
  process.stderr.write(
    'Make sure you are running the command from within a version-controlled project\n'
  )
  process.exit(1)
}

// parse args
// start sync server
// init storage
// extract current versions
// extract prev versions
// find changes
// extract diffs

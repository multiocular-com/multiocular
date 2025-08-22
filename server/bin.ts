import { parseArgs } from './cli/args.ts'
import { type FilePath, findProjectRoot } from './index.ts'

const config = await parseArgs(process.argv.slice(2))

if (config.command === 'run') {
  let root = findProjectRoot(process.cwd() as FilePath)

  if (!root) {
    process.stderr.write(
      'Error: Could not find project root directory containing a VCS folder (.git, .hg, or .svn)\n'
    )
    process.stderr.write(
      'Make sure you are running the command from within a version-controlled project\n'
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

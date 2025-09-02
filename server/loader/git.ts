import { exec } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { promisify } from 'node:util'

import type { File, FilePath } from '../../common/types.ts'
import { loadedFile, missingFile } from '../../common/types.ts'
import { debug } from '../cli/print.ts'

const execAsync = promisify(exec)

class GitError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GitError'
  }
}

async function git(
  args: string,
  root: FilePath,
  debugMode = false
): Promise<string> {
  if (debugMode) {
    debug(`> git ${args}`)
  }
  try {
    let result = await execAsync(`git ${args}`, {
      cwd: root,
      encoding: 'utf8'
    })
    if (!args.startsWith('show ') && debugMode) {
      debug(result.stdout)
    }
    return result.stdout
  } catch (error) {
    if (error instanceof Error && 'stderr' in error) {
      if (debugMode) {
        debug(error.stderr as string)
      }
      throw new GitError(error.stderr as string)
    }
    throw error
  }
}

function toFiles(stdout: string): FilePath[] {
  return stdout
    .trim()
    .split('\n')
    .filter(file => file.length > 0) as FilePath[]
}

export async function loadFile(
  root: FilePath,
  commit: false | string,
  file: FilePath,
  debugMode = false
): Promise<File> {
  let path = join(root, file)
  if (!commit) {
    return loadedFile(path, await readFile(path))
  } else {
    try {
      return loadedFile(
        path,
        await git(`show ${commit}:${file}`, root, debugMode)
      )
    } catch (error) {
      if (error instanceof GitError) {
        if (
          error.message.includes('does not exist') ||
          error.message.includes('exists on disk, but not in')
        ) {
          return missingFile(path)
        }
      }
      throw error
    }
  }
}

export async function getChangedFiles(
  root: FilePath,
  between: string,
  debugMode = false
): Promise<FilePath[]> {
  let files = toFiles(
    await git(`diff --name-only --diff-filter=AM ${between}`, root, debugMode)
  )
  if (between === 'HEAD') {
    let untracked = await git(
      'ls-files --others --exclude-standard',
      root,
      debugMode
    )
    files.push(...toFiles(untracked))
  }
  return files
}

import { exec } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { promisify } from 'node:util'

import type { File, FilePath } from '../types.ts'
import { loadedFile, missingFile } from '../types.ts'

const execAsync = promisify(exec)

class GitError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GitError'
  }
}

async function git(args: string, root: FilePath): Promise<string> {
  try {
    let result = await execAsync(`git ${args}`, {
      cwd: root,
      encoding: 'utf8'
    })
    return result.stdout
  } catch (error) {
    if (error instanceof Error && 'stderr' in error) {
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
  file: FilePath
): Promise<File> {
  let path = join(root, file)
  if (!commit) {
    return loadedFile(path, await readFile(path))
  } else {
    try {
      return loadedFile(path, await git(`show ${commit}:${file}`, root))
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
  between: string
): Promise<FilePath[]> {
  let files = toFiles(
    await git(`diff --name-only --diff-filter=AM ${between}`, root)
  )
  if (between === 'HEAD') {
    let untracked = await git('ls-files --others --exclude-standard', root)
    files.push(...toFiles(untracked))
  }
  return files
}

import { exec } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { promisify } from 'node:util'

import type { FilePath, LoadedFile } from '../types.ts'

const execAsync = promisify(exec)

async function git(args: string, root: FilePath): Promise<string> {
  let result = await execAsync(`git ${args}`, {
    cwd: root,
    encoding: 'utf8'
  })
  return result.stdout
}

export async function loadFile(
  root: FilePath,
  commit: false | string,
  file: FilePath
): Promise<LoadedFile> {
  let content: string
  let path = join(root, file)
  if (!commit) {
    content = (await readFile(path)).toString()
  } else {
    content = await git(`show ${commit}:${file}`, root)
  }
  return {
    content,
    path
  } as LoadedFile
}

export async function getChangedFiles(
  root: FilePath,
  between: string
): Promise<FilePath[]> {
  let list = await git(`diff --name-only ${between}`, root)
  return list
    .trim()
    .split('\n')
    .filter(file => file.length > 0) as FilePath[]
}

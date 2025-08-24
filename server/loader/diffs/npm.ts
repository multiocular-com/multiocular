import libnpmdiff from 'libnpmdiff'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import type { Diff } from '../../types.ts'
import type { DiffLoader } from './common.ts'

export const npm = (async change => {
  let diff: string

  if (change.before === false) {
    let tempDir = await mkdtemp(join(tmpdir(), 'empty-npm-'))
    try {
      let emptyPackagePath = join(tempDir, 'package.json')
      await writeFile(emptyPackagePath, '{}')
      diff = await libnpmdiff([tempDir, `${change.name}@${change.after}`])
    } finally {
      await rm(tempDir, { force: true, recursive: true })
    }
  } else {
    diff = await libnpmdiff([
      `${change.name}@${change.before}`,
      `${change.name}@${change.after}`
    ])
  }

  return diff as Diff
}) satisfies DiffLoader

import Arborist from '@npmcli/arborist'
import libnpmdiff from 'libnpmdiff'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { diff } from '../../types.ts'
import { type DiffLoader, getDiffPrefixes } from './common.ts'

export const npm = (async change => {
  let { diffDstPrefix, diffSrcPrefix } = getDiffPrefixes(change)

  if (change.before === false) {
    let tempDir = await mkdtemp(join(tmpdir(), 'empty-npm-'))
    try {
      let emptyPackagePath = join(tempDir, 'package.json')
      await writeFile(emptyPackagePath, '{}')
      return diff(
        await libnpmdiff([tempDir, `${change.name}@${change.after}`], {
          Arborist,
          diffDstPrefix,
          diffSrcPrefix
        })
      )
    } finally {
      await rm(tempDir, { force: true, recursive: true })
    }
  } else {
    return diff(
      await libnpmdiff(
        [`${change.name}@${change.before}`, `${change.name}@${change.after}`],
        {
          Arborist,
          diffDstPrefix,
          diffSrcPrefix
        }
      )
    )
  }
}) satisfies DiffLoader

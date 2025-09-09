import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { findNpmRoot } from '../npm.ts'
import {
  CHANGELOG_NAMES,
  type ChangeLogLoader,
  filterChangelogByVersionRange,
  parseChangelog
} from './common.ts'

export const npm = (async (root, change) => {
  if (change.type !== 'npm') return null
  let packageDir = findNpmRoot(root, change.name, change.after)
  if (!packageDir) return null
  for (let filename of CHANGELOG_NAMES) {
    let filePath = join(packageDir, filename)
    if (!existsSync(filePath)) continue
    let changelog = parseChangelog(await readFile(filePath, 'utf-8'))
    return filterChangelogByVersionRange(changelog, change.after, change.before)
  }
  return null
}) satisfies ChangeLogLoader

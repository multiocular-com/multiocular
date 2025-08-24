import libnpmdiff from 'libnpmdiff'

import type { Diff } from '../../types.ts'
import type { DiffLoader } from './common.ts'

export const npm = (async change => {
  let diff = await libnpmdiff([
    `${change.name}@${change.before}`,
    `${change.name}@${change.after}`
  ])
  return diff as Diff
}) satisfies DiffLoader

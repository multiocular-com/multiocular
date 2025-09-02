import type { Change, Diff } from '../../../common/types.ts'

/**
 * Load dependency diff from version changes.
 */
export interface DiffLoader {
  (version: Change): Promise<Diff>
}

/**
 * Generate diff prefixes for libnpmdiff based on change information
 */
export function getDiffPrefixes(change: Change): {
  diffDstPrefix: string
  diffSrcPrefix: string
} {
  let beforeVersion = change.before === false ? 'new' : change.before
  let afterVersion = change.after

  return {
    diffDstPrefix: `${change.type}:${change.name}@${afterVersion}/`,
    diffSrcPrefix: `${change.type}:${change.name}@${beforeVersion}/`
  }
}

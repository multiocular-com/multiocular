import type { Change, Diff } from '../../../common/types.ts'

export interface DiffLoader {
  (version: Change): Promise<Diff>
}

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

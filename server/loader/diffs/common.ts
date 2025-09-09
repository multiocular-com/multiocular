import type { Change } from '../../../common/stores.ts'
import type { Diff, FilePath, Repository } from '../../../common/types.ts'

export interface DiffLoader {
  findRepository(root: FilePath, change: Change): Repository
  loadDiff(version: Change): Promise<Diff>
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

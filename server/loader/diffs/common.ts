import type { Change } from '../../../common/stores.ts'
import type { Diff, FilePath, RepositoryURL } from '../../../common/types.ts'

export interface DiffLoader {
  findRepository(
    root: FilePath,
    change: Change
  ): Promise<RepositoryURL> | RepositoryURL
  loadDiff(root: FilePath, change: Change): Promise<Diff>
}

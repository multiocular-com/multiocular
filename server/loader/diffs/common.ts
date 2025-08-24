import type { Change, Diff } from '../../types.ts'

export interface DiffLoader {
  (version: Change): Promise<Diff>
}

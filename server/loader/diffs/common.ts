import type { Change, Diff } from '../../types.ts'

/**
 * Load dependency diff from version changes.
 */
export interface DiffLoader {
  (version: Change): Promise<Diff>
}

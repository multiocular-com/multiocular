import type { Change } from '../../types.ts'
import type { DiffLoader } from './common.ts'
import { npm } from './npm.ts'

export const diffLoaders = {
  npm
} satisfies Record<Change['type'], DiffLoader>

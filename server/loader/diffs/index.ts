import type { Change } from '../../../common/types.ts'
import type { DiffLoader } from './common.ts'
import { githubActions } from './github-actions.ts'
import { npm } from './npm.ts'

export const diffLoaders = {
  'github-actions': githubActions,
  npm
} satisfies Record<Change['type'], DiffLoader>

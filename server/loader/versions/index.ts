import type { VersionsLoader } from './common.ts'
import { githubActions } from './github-actions.ts'
import { npm } from './npm.ts'
import { pnpm } from './pnpm.ts'
import { yarn } from './yarn.ts'

export const versionsLoaders = {
  'github-actions': githubActions,
  npm,
  pnpm,
  yarn
} satisfies Record<string, VersionsLoader>

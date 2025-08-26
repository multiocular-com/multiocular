import type { VersionsLoader } from './common.ts'
import { npm } from './npm.ts'
import { pnpm } from './pnpm.ts'
import { yarn } from './yarn.ts'

export const versionsLoaders = { npm, pnpm, yarn } satisfies Record<
  string,
  VersionsLoader
>

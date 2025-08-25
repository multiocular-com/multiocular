import type { VersionsLoader } from './common.ts'
import { npm } from './npm.ts'
import { pnpm } from './pnpm.ts'

export const versionsLoaders = { npm, pnpm } satisfies Record<
  string,
  VersionsLoader
>

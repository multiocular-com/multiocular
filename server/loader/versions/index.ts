import type { VersionsLoader } from './common.ts'
import { pnpm } from './pnpm.ts'

export const versionsLoaders = { pnpm } satisfies Record<string, VersionsLoader>

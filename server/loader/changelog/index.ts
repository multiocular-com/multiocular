import type { ChangeLogLoader } from './common.ts'
import { githubReleases } from './github-releases.ts'
import { github } from './github.ts'
import { npm } from './npm.ts'

export const changelogLoaders = [
  npm,
  githubReleases,
  github
] satisfies ChangeLogLoader[]

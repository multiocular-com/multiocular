import type { ChangeLog } from '../../../common/stores.ts'
import type {
  ChangeLogTitle,
  GitHubRepositoryURL,
  Markdown
} from '../../../common/types.ts'
import { githubApi, isGitHubUrl } from '../github.ts'
import { normalizeVersion } from '../versions.ts'
import type { ChangeLogLoader } from './common.ts'
import { filterChangelogByVersionRange } from './common.ts'

interface GitHubRelease {
  body: string
  tag_name: string
}

async function fetchGitHubReleases(
  repository: GitHubRepositoryURL
): Promise<ChangeLog | null> {
  let releases = await githubApi<GitHubRelease[]>(repository, '/releases')
  if (!Array.isArray(releases)) return null
  let changelog: ChangeLog = []
  for (let release of releases) {
    if (release.tag_name && release.body) {
      let version = normalizeVersion(release.tag_name) as ChangeLogTitle
      changelog.push([version, release.body.trim() as Markdown])
    }
  }
  return changelog
}

export const githubReleases = (async (root, change) => {
  if (!isGitHubUrl(change.repository)) return null
  let releases = await fetchGitHubReleases(change.repository)
  if (!releases || releases.length === 0) return null
  return filterChangelogByVersionRange(
    false,
    releases,
    change.after,
    change.before
  )
}) satisfies ChangeLogLoader

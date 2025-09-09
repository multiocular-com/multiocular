import type { ChangeLog } from '../../../common/stores.ts'
import type { ChangeLogContent, Repository } from '../../../common/types.ts'
import { githubApi } from '../github.ts'
import type { ChangeLogLoader } from './common.ts'
import { filterChangelogByVersionRange, normalizeVersion } from './common.ts'

interface GitHubRelease {
  body: string
  tag_name: string
}

async function fetchGitHubReleases(
  repository: Repository
): Promise<ChangeLog | null> {
  let releases = await githubApi<GitHubRelease[]>(repository, 'releases')
  if (!Array.isArray(releases)) return null
  let changelog: ChangeLog = []
  for (let release of releases) {
    if (release.tag_name && release.body) {
      let version = normalizeVersion(release.tag_name)
      changelog.push([version, release.body.trim() as ChangeLogContent])
    }
  }
  return changelog
}

export const githubReleases = (async (root, change) => {
  if (!change.repository || !change.repository.includes('github.com')) {
    return null
  }
  let releases = await fetchGitHubReleases(change.repository)
  if (!releases) return null
  return filterChangelogByVersionRange(releases, change.after, change.before)
}) satisfies ChangeLogLoader

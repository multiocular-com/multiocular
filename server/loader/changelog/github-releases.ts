import type { ChangeLog } from '../../../common/stores.ts'
import type { ChangeLogContent } from '../../../common/types.ts'
import type { ChangeLogLoader } from './common.ts'
import { filterChangelogByVersionRange, normalizeVersion } from './common.ts'

interface GitHubRelease {
  body: string
  tag_name: string
}

async function fetchGitHubReleases(
  repository: string
): Promise<ChangeLog | null> {
  let match = repository.match(/github\.com\/([^/]+)\/([^/]+)/)
  if (!match) return null
  let [, owner, repo] = match
  if (!repo) return null
  repo = repo.replace(/\.git$/, '')

  try {
    let response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/releases`
    )
    if (!response.ok) return null

    let releases = (await response.json()) as GitHubRelease[]
    if (!Array.isArray(releases)) return null

    let changelog: ChangeLog = []
    for (let release of releases) {
      if (release.tag_name && release.body) {
        let version = normalizeVersion(release.tag_name)
        changelog.push([version, release.body.trim() as ChangeLogContent])
      }
    }

    return changelog
  } catch {
    return null
  }
}

export const githubReleases = (async (root, change) => {
  if (!change.repository || !change.repository.includes('github.com')) {
    return null
  }
  let releases = await fetchGitHubReleases(change.repository)
  if (!releases) return null
  return filterChangelogByVersionRange(releases, change.after, change.before)
}) satisfies ChangeLogLoader

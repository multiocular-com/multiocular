import type { ChangeLogLoader } from './common.ts'
import {
  CHANGELOG_NAMES,
  filterChangelogByVersionRange,
  parseChangelog
} from './common.ts'

async function fetchGitHubChangelog(
  repository: string
): Promise<null | string> {
  let match = repository.match(/github\.com\/([^/]+)\/([^/]+)/)
  if (!match) return null
  let [, owner, repo] = match
  if (!repo) return null
  repo = repo.replace(/\.git$/, '')

  for (let path of CHANGELOG_NAMES) {
    for (let branch of ['main', 'master']) {
      try {
        let response = await fetch(
          `https://raw.githubusercontent.com/` +
            `${owner}/${repo}/${branch}/${path}`
        )
        if (response.ok) return await response.text()
      } catch {
        // Try next combination
      }
    }
  }
  return null
}

export const github = (async (root, change) => {
  if (!change.repository || !change.repository.includes('github.com')) {
    return null
  }

  try {
    let changelogContent = await fetchGitHubChangelog(change.repository)
    if (!changelogContent) return null
    let changelog = parseChangelog(changelogContent)
    return filterChangelogByVersionRange(changelog, change.after, change.before)
  } catch {
    return null
  }
}) satisfies ChangeLogLoader

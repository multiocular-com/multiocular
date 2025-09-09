import type { GitHubRepositoryURL } from '../../../common/types.ts'
import { getFileForGithub, githubApi, isGitHubUrl } from '../github.ts'
import type { ChangeLogLoader } from './common.ts'
import {
  CHANGELOG_NAMES,
  filterChangelogByVersionRange,
  parseChangelog
} from './common.ts'

interface GitHubRepo {
  default_branch: string
}

interface GitHubTreeItem {
  path: string
  type: string
}

interface GitHubTree {
  tree: GitHubTreeItem[]
}

async function fetchGitHubChangelog(
  repository: GitHubRepositoryURL
): Promise<null | string> {
  let repoInfo = await githubApi<GitHubRepo>(repository, '')
  if (!repoInfo) return null

  let branch = repoInfo.default_branch
  let tree = await githubApi<GitHubTree>(repository, `git/trees/${branch}`)
  if (!tree) return null

  let files = tree.tree
    .filter(item => item.type === 'blob')
    .map(item => item.path)

  for (let changelogName of CHANGELOG_NAMES) {
    if (files.includes(changelogName)) {
      let content = await getFileForGithub(repository, branch, changelogName)
      if (content) return content
    }
  }

  return null
}

export const github = (async (root, change) => {
  if (!isGitHubUrl(change.repository)) return null

  try {
    let changelogContent = await fetchGitHubChangelog(change.repository)
    if (!changelogContent) return null
    let changelog = parseChangelog(changelogContent)
    return filterChangelogByVersionRange(changelog, change.after, change.before)
  } catch {
    return null
  }
}) satisfies ChangeLogLoader

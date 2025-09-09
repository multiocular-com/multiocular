import type {
  GitHubRepository,
  GitHubRepositoryURL,
  RepositoryURL
} from '../../common/types.ts'
import { warn } from '../cli/print.ts'

export function isGitHubUrl(
  url: RepositoryURL | undefined
): url is GitHubRepositoryURL {
  return !!url && url.includes('github.com')
}

function isRepositoryUrl(
  value: GitHubRepository | GitHubRepositoryURL
): value is GitHubRepositoryURL {
  return value.includes('github.com')
}

export function parseRepoFromUrl(
  url: GitHubRepositoryURL
): GitHubRepository | null {
  let match = url.match(/github\.com\/([^/]+)\/([^/]+)/)
  if (!match) return null
  return `${match[1]}/${match[2]!.replace(/\.git$/, '')}` as GitHubRepository
}

export async function githubApi<Response>(
  repo: GitHubRepository | GitHubRepositoryURL,
  path: string
): Promise<null | Response> {
  let name = isRepositoryUrl(repo) ? parseRepoFromUrl(repo) : repo
  let headers: HeadersInit = {}
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }
  let response = await fetch(`https://api.github.com/repos/${name}/${path}`, {
    headers
  })
  if (response.status === 404) return null
  if (!response.ok) {
    warn('Network error on retrieving changelog', await response.text())
    return null
  }

  return (await response.json()) as Response
}

export async function getFileForGithub(
  repo: GitHubRepository | GitHubRepositoryURL,
  branch: string,
  path: string
): Promise<null | string> {
  let name = isRepositoryUrl(repo) ? parseRepoFromUrl(repo) : repo
  try {
    let response = await fetch(
      `https://raw.githubusercontent.com/${name}/${branch}/${path}`
    )
    if (!response.ok) return null
    return await response.text()
  } catch {
    return null
  }
}

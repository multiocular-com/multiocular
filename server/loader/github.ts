import type { DependencyName, Repository } from '../../common/types.ts'
import { warn } from '../cli/print.ts'

export async function githubApi<Response>(
  repository: DependencyName | Repository,
  path: string
): Promise<null | Response> {
  let where: string = repository
  if (repository.includes('github.com')) {
    let match = repository.match(/github\.com\/([^/]+)\/([^/]+)/)
    if (!match) return null
    where = `${match[1]}/${match[2]!.replace(/\.git$/, '')}`
  } else {
    where = repository
  }
  let headers: HeadersInit = {}
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }
  let response = await fetch(`https://api.github.com/repos/${where}/${path}`, {
    headers
  })
  if (response.status === 404) return null
  if (!response.ok) {
    warn('Network error on retrieving changelog', await response.text())
    return null
  }

  return (await response.json()) as Response
}

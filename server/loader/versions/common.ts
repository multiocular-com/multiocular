import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

import type {
  Dependency,
  DependencyName,
  DependencyVersion,
  FilePath,
  LoadedFile,
  Repository
} from '../../../common/types.ts'

/**
 * Load versions list from changed files.
 */
export interface VersionsLoader {
  /**
   * Select files with versions (like lock files) from changed files.
   *
   * @param changed Changed files in commit or uncommited files.
   */
  findFiles(changed: FilePath[]): FilePath[]
  /**
   * Extract versions from file content.
   *
   * @param files Files selected at {@link VersionsLoader#findFiles}.
   */
  load(files: LoadedFile[]): Dependency[]
}

/**
 * Parse name and version in strings like:
 *
 * nanoid@5.0.0
 * @types/node@22.0.0
 * "@types/node@npm:22.0.0"
 */
export function splitPackage(pkg: string): {
  name: DependencyName
  version: DependencyVersion
} {
  // For yarn format
  if (pkg.startsWith('"') && pkg.endsWith('"')) {
    pkg = pkg.slice(1, -1)
  }
  pkg = pkg.replace('@npm:', '@')

  // Looking from the end to support scoped packaged like @types/node
  let lastAtIndex = pkg.lastIndexOf('@')
  if (lastAtIndex > 0) {
    return {
      name: pkg.substring(0, lastAtIndex) as DependencyName,
      version: pkg.substring(lastAtIndex + 1) as DependencyVersion
    }
  }
  return { name: pkg as DependencyName, version: '' as DependencyVersion }
}

interface PackageJson {
  bugs?: { url: string } | string
  homepage?: string
  private?: true
  repository?: { type?: string; url: string } | string
}

function extractRepositoryUrl(packageJsonContent: string): null | string {
  let pkg = JSON.parse(packageJsonContent) as PackageJson
  if (pkg.private) return null
  if (pkg.repository) {
    if (typeof pkg.repository === 'string') {
      return normalizeRepositoryUrl(pkg.repository)
    }
    if (typeof pkg.repository === 'object' && pkg.repository.url) {
      return normalizeRepositoryUrl(pkg.repository.url)
    }
  }
  if (pkg.homepage?.includes('github.com')) {
    return normalizeRepositoryUrl(pkg.homepage)
  }
  if (typeof pkg.bugs === 'object' && pkg.bugs.url.includes('github.com')) {
    return normalizeRepositoryUrl(pkg.bugs.url)
  }
  return null
}

const GIT_URL_POSTFIX = /\.git(#\w+)?$/

function normalizeRepositoryUrl(url: string): Repository {
  if (url.startsWith('git+http')) {
    url = url.replace('git+', '').replace(GIT_URL_POSTFIX, '')
  }
  if (url.startsWith('git+ssh')) {
    url = url.replace('git+ssh://git@', 'https://').replace(GIT_URL_POSTFIX, '')
  }
  if (url.startsWith('github:')) {
    url = url.replace('github:', 'https://github.com/')
  }
  if (url.includes('github.com')) {
    url = url.replace(/\.git$/, '')
    url = url.replace(/#.*$/, '')
    url = url.replace(/\/issues.*$/, '')
    url = url.replace(/\/tree.*$/, '')
    if (!url.startsWith('http')) {
      let match = url.match(/github\.com[/:](.+)/)
      if (match) {
        url = `https://github.com/${match[1]}`
      }
    }
  } else if (
    !url.includes('://') &&
    url.includes('/') &&
    !url.startsWith('.')
  ) {
    url = `https://github.com/${url}`
  }
  return url as Repository
}

export function findRepositorySource(
  url: object | string | undefined,
  name: string
): Repository {
  if (typeof url === 'string' && url.startsWith('git')) {
    return normalizeRepositoryUrl(url)
  } else {
    try {
      let require = createRequire(import.meta.url)
      let packageJsonPath = require.resolve(`${name}/package.json`)
      let packageJsonContent = readFileSync(packageJsonPath, 'utf8')
      let repoUrl = extractRepositoryUrl(packageJsonContent)
      if (repoUrl) return repoUrl as Repository
    } catch {
      // Package not found in node_modules
    }

    return `https://www.npmjs.com/package/${name}` as Repository
  }
}

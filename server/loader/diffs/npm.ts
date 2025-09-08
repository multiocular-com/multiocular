import Arborist from '@npmcli/arborist'
import libnpmdiff from 'libnpmdiff'
import { readFileSync } from 'node:fs'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import type { Change } from '../../../common/stores.ts'
import { diff, type Repository } from '../../../common/types.ts'
import { type DiffLoader, getDiffPrefixes } from './common.ts'

interface PackageJson {
  bugs?: { url: string } | string
  homepage?: string
  private?: true
  repository?: { type?: string; url: string } | string
}

function extractRepositoryUrl(packageJson: string): null | Repository {
  let pkg = JSON.parse(packageJson) as PackageJson
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

export const npm = {
  findRepository(change: Change): Repository {
    try {
      let require = createRequire(import.meta.url)
      let repoUrl = extractRepositoryUrl(
        readFileSync(require.resolve(`${change.name}/package.json`), 'utf8')
      )
      if (repoUrl) return repoUrl
    } catch {
      // Package not found in node_modules
    }
    return `https://www.npmjs.com/package/${change.name}` as Repository
  },

  async loadDiff(change: Change) {
    let { diffDstPrefix, diffSrcPrefix } = getDiffPrefixes(change)

    if (change.before === false) {
      let tempDir = await mkdtemp(join(tmpdir(), 'empty-npm-'))
      try {
        let emptyPackagePath = join(tempDir, 'package.json')
        await writeFile(emptyPackagePath, '{}')
        return diff(
          await libnpmdiff([tempDir, `${change.name}@${change.after}`], {
            Arborist,
            diffDstPrefix,
            diffSrcPrefix
          })
        )
      } finally {
        await rm(tempDir, { force: true, recursive: true })
      }
    } else {
      return diff(
        await libnpmdiff(
          [`${change.name}@${change.before}`, `${change.name}@${change.after}`],
          {
            Arborist,
            diffDstPrefix,
            diffSrcPrefix
          }
        )
      )
    }
  }
} satisfies DiffLoader

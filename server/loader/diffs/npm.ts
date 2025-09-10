import Arborist from '@npmcli/arborist'
import libnpmdiff from 'libnpmdiff'
import { readFileSync } from 'node:fs'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { diff, type RepositoryURL } from '../../../common/types.ts'
import { getNpmContent } from '../npm.ts'
import { type DiffLoader, getDiffPrefixes } from './common.ts'

interface PackageJson {
  bugs?: { url: string } | string
  homepage?: string
  private?: true
  repository?: { type?: string; url: string } | string
}

function extractRepositoryUrl(packageJson: string): null | RepositoryURL {
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

function normalizeRepositoryUrl(url: string): RepositoryURL {
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
  return url as RepositoryURL
}

export const npm = {
  async findRepository(root, change) {
    let packageDir = await getNpmContent(root, change.name, change.after)
    if (packageDir) {
      let repoUrl = extractRepositoryUrl(
        readFileSync(join(packageDir, 'package.json'), 'utf8')
      )
      if (repoUrl) return repoUrl
    }
    return `https://www.npmjs.com/package/${change.name}` as RepositoryURL
  },

  async loadDiff(change) {
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

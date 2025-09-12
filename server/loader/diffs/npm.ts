import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join, sep } from 'node:path'

import { diffType, type RepositoryURL } from '../../../common/types.ts'
import { createEmptyDir, getNpmContent } from '../npm.ts'
import type { DiffLoader } from './common.ts'

function runDiff(...args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    let child = spawn('git', ['diff', ...args], { stdio: 'pipe' })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', data => {
      stdout += `${data}`
    })
    child.stderr.on('data', data => {
      stderr += `${data}`
    })
    child.on('close', code => {
      if (code === 0 || code === 1) {
        resolve(stdout)
      } else {
        reject(new Error(`Command failed with exit code ${code}\n${stderr}`))
      }
    })
    child.on('error', error => {
      reject(error)
    })
  })
}

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

  async loadDiff(root, change) {
    let after = await getNpmContent(root, change.name, change.after)
    let before = change.before
      ? await getNpmContent(root, change.name, change.before)
      : await createEmptyDir()
    return diffType(
      (
        await runDiff(
          '--no-index',
          '--ignore-space-change',
          '--no-ext-diff',
          `${before}${sep}`,
          `${after}${sep}`
        )
      )
        .replaceAll(before, '')
        .replaceAll(after, '')
    )
  }
} satisfies DiffLoader

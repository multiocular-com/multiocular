import { basename, dirname } from 'node:path'
import { parse } from 'yaml'

import {
  dependency,
  type Dependency,
  type DependencyName,
  type DependencyVersion
} from '../../../common/types.ts'
import type { VersionsLoader } from './common.ts'

interface GitHubActionReference {
  name: DependencyName
  realVersion?: DependencyVersion
  version: DependencyVersion
}

function isObject(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === 'object' && obj !== null
}

function escapeRegexp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function parseGitHubActionsFromYaml(content: string): GitHubActionReference[] {
  let actions: GitHubActionReference[] = []

  let parsed = parse(content)
  if (typeof parsed !== 'object' || parsed === null) {
    return actions
  }

  function findUses(obj: unknown): void {
    if (Array.isArray(obj)) {
      for (let item of obj) findUses(item)
    } else if (isObject(obj)) {
      for (let key in obj) {
        let value = obj[key]
        if (key === 'uses' && typeof value === 'string') {
          let action = parseActionReference(value, content)
          if (action) actions.push(action)
        } else {
          findUses(value)
        }
      }
    }
  }

  findUses(parsed)
  return actions
}

function parseActionReference(
  uses: string,
  content: string
): GitHubActionReference | null {
  // Handle different formats:
  // actions/checkout@v4.2.0
  // actions/checkout@abc123def (commit hash)
  // actions/checkout@abc123def # v4.2.0 (commit with tag comment)
  // docker://alpine:3.8
  // ./path/to/action

  if (uses.startsWith('./') || uses.startsWith('docker://')) {
    return null
  }

  let atIndex = uses.lastIndexOf('@')
  if (atIndex === -1) return null

  let name = uses.substring(0, atIndex) as DependencyName
  let version = uses.substring(atIndex + 1) as DependencyVersion
  if (!name.includes('/') || name.split('/').length < 2) return null

  let isCommitHash = /^[a-f0-9]{40}$/.test(version)
  if (isCommitHash) {
    let regex = new RegExp(
      `${escapeRegexp(name)}@${escapeRegexp(version)}` +
        `\\s*#\\s*([v]?\\d+\\.\\d+\\.\\d+)`
    )
    let match = content.match(regex)
    if (match) {
      return {
        name,
        realVersion: version,
        version: match[1]! as DependencyVersion
      }
    }
  }

  return { name, version }
}

export const githubActions = {
  findFiles(changed) {
    return changed.filter(path => {
      let name = basename(path)
      return (
        dirname(path).includes('.github') &&
        (name.endsWith('.yml') || name.endsWith('.yaml'))
      )
    })
  },
  load(files) {
    let dependencies: Dependency[] = []
    let seen = new Set<string>()

    for (let file of files) {
      let actions = parseGitHubActionsFromYaml(file.content)

      for (let action of actions) {
        let key = `${action.name}@${action.version}`
        if (!seen.has(key)) {
          seen.add(key)
          let dep = dependency({
            from: 'github-actions',
            name: action.name,
            source: file.path,
            type: 'github-actions',
            version: action.version
          })
          if (action.realVersion) dep.realVersion = action.realVersion
          dependencies.push(dep)
        }
      }
    }

    return dependencies
  }
} satisfies VersionsLoader

import { basename } from 'node:path'
import { parse } from 'yaml'

import { type Dependency, dependencyType } from '../../../common/types.ts'
import type { VersionsLoader } from './common.ts'
import { splitPackage } from './common.ts'

type ParsedDependency = {
  name: string
  resolved?: string
  version: string
}

function isYarnBerry(content: string): boolean {
  // Check if it's Yarn Berry by looking for __metadata section
  return content.includes('__metadata:') && content.includes('version:')
}

function parseYarn1Lock(content: string): ParsedDependency[] {
  let entries: Record<string, { resolved?: string; version: string }> = {}
  let lines = content.split('\n')
  let currentKey = ''

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    if (!line) continue
    if (line.startsWith('#') || line.trim() === '') continue

    // Package entry (ends with colon, not indented)
    if (line.match(/^[^#\s].*:$/) && !line.startsWith(' ')) {
      currentKey = line.slice(0, -1) // Remove trailing colon
      entries[currentKey] = { version: '' }
    }
    // Version line (indented, starts with version)
    else if (line.match(/^\s+version\s/) && currentKey) {
      let versionMatch = line.match(/^\s+version\s+"([^"]+)"/)
      if (versionMatch?.[1]) {
        entries[currentKey]!.version = versionMatch[1].trim()
      }
    }
    // Resolved line (indented, starts with resolved)
    else if (line.match(/^\s+resolved\s/) && currentKey) {
      let resolvedMatch = line.match(/^\s+resolved\s+"([^"]+)"/)
      if (resolvedMatch?.[1]) {
        entries[currentKey]!.resolved = resolvedMatch[1].trim()
      }
    }
  }

  let dependencies: ParsedDependency[] = []
  for (let entry in entries) {
    let entryData = entries[entry]
    if (!entryData?.version) continue

    // Yarn 1 format: @scope/package@^1.0.0 or package@^1.0.0
    let { name } = splitPackage(entry)
    if (!name) continue

    dependencies.push({
      name,
      resolved: entryData.resolved,
      version: entryData.version
    })
  }

  return dependencies
}

function parseYarnBerryLock(content: string): ParsedDependency[] {
  let parsed = parse(content) as Record<string, unknown>
  let dependencies: ParsedDependency[] = []

  for (let key in parsed) {
    // Yarn Berry metadata
    if (key === '__metadata' || key.includes('@workspace:')) {
      continue
    }

    let value = parsed[key]
    if (
      typeof value === 'object' &&
      value !== null &&
      'version' in value &&
      typeof value.version === 'string'
    ) {
      // Yarn Berry format: "package@npm:1.0.0" or "@scope/package@npm:1.0.0"
      let name = splitPackage(key).name
      if (!name) continue

      dependencies.push({
        name,
        resolved:
          'resolution' in value && typeof value.resolution === 'string'
            ? value.resolution
            : undefined,
        version: value.version
      })
    }
  }

  return dependencies
}

export const yarn = {
  findFiles(changed) {
    return changed.filter(file => basename(file) === 'yarn.lock')
  },
  load(lockFiles) {
    let dependencies: Dependency[] = []

    for (let file of lockFiles) {
      let parsedDeps = isYarnBerry(file.content)
        ? parseYarnBerryLock(file.content)
        : parseYarn1Lock(file.content)

      for (let dep of parsedDeps) {
        let version = dep.version

        if (
          dep.resolved?.includes('github.com') ||
          dep.resolved?.includes('git+')
        ) {
          version = dep.resolved || version
        }

        dependencies.push(
          dependencyType({
            from: 'yarn',
            name: dep.name,
            source: file.path,
            type: 'npm',
            version
          })
        )
      }
    }

    return dependencies
  }
} satisfies VersionsLoader

import {
  type Change,
  getChangeId,
  UpdateType,
  type UpdateTypeValue
} from '../../common/stores.ts'
import type {
  ChangeLogTitle,
  Dependency,
  DependencyVersion
} from '../../common/types.ts'

export function normalizeVersion(version: string): string {
  let versionMatch = version.match(/\d+\.\d+(?:\.\d+)?(?:-[\w.]+)?/)
  if (versionMatch) {
    return versionMatch[0]
  } else {
    return version
      .trim()
      .replace(/^\s*v?/i, '')
      .replace(/\s.*$/, '')
  }
}

export function parseVersion(
  version: ChangeLogTitle | DependencyVersion
): [number, number, number] {
  let [major, minor, patch] = normalizeVersion(version)
    .split('.')
    .map(i => parseInt(i))
  return [major ?? 0, minor ?? 0, patch ?? 0]
}

function getUpdateType(
  before: Dependency | undefined,
  after: Dependency
): UpdateTypeValue {
  if (!before) return UpdateType.MAJOR

  let beforeParts = before.version.split('.').map(Number)
  let afterParts = after.version.split('.').map(Number)
  if (beforeParts[0] !== afterParts[0]) {
    return UpdateType.MAJOR
  } else if (beforeParts[1] !== afterParts[1]) {
    return UpdateType.MINOR
  } else {
    return UpdateType.PATCH
  }
}

function createChange(
  before: Dependency | undefined,
  after: Dependency
): Change {
  let change: Change = {
    after: after.version,
    before: before ? before.version : false,
    direct: after.direct,
    from: after.from,
    id: getChangeId(after.type, after.name, before?.version, after.version),
    name: after.name,
    status: 'loading',
    type: after.type,
    update: getUpdateType(before, after)
  }
  if (after.realVersion) change.realAfter = after.realVersion
  if (before?.realVersion) change.realBefore = before.realVersion
  return change
}

function compareVersions(a: DependencyVersion, b: DependencyVersion): number {
  let aIsGit = /^[a-f0-9]{40}$/.test(a)
  let bIsGit = /^[a-f0-9]{40}$/.test(b)
  if (aIsGit && bIsGit) return a.localeCompare(b)
  if (aIsGit && !bIsGit) return 1
  if (!aIsGit && bIsGit) return -1

  let aParts = parseVersion(a)
  let bParts = parseVersion(b)
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    let aPart = aParts[i] || 0
    let bPart = bParts[i] || 0
    if (aPart !== bPart) {
      return aPart - bPart
    }
  }
  return 0
}

function findMatching(dependencies: Dependency[], target: Dependency): boolean {
  return dependencies.some(i => {
    return (
      i.name === target.name &&
      i.version === target.version &&
      i.type === target.type
    )
  })
}

export function calculateVersionDiff(
  beforeVersions: Dependency[],
  afterVersions: Dependency[]
): Change[] {
  let changes: Change[] = []

  for (let after of afterVersions) {
    if (!findMatching(beforeVersions, after)) {
      let candidates = beforeVersions.filter(i => {
        return (
          i.name === after.name &&
          i.type === after.type &&
          i.version !== after.version // Because later we will add after anyway
        )
      })

      if (candidates.length === 0) {
        changes.push(createChange(undefined, after))
        continue
      }

      // Sort all version by semver
      let allVersions = [...candidates, after].sort((a, b) => {
        return compareVersions(a.version, b.version)
      })

      // Find the after version position and get the previous element
      let afterIndex = allVersions.findIndex(v => v === after)
      let previous = afterIndex > 0 ? allVersions[afterIndex - 1] : undefined

      changes.push(createChange(previous, after))
    }
  }

  return changes
}

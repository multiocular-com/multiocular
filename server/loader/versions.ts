import { type Change, getChangeId } from '../../common/stores.ts'
import type { Dependency } from '../../common/types.ts'

function createChange(
  before: Dependency | undefined,
  after: Dependency
): Change {
  let change: Change = {
    after: after.version,
    before: before ? before.version : false,
    from: after.from,
    id: getChangeId(after.type, after.name, before?.version, after.version),
    name: after.name,
    repository: after.repository,
    status: 'loading',
    type: after.type
  }
  if (after.realVersion) change.realAfter = after.realVersion
  if (before?.realVersion) change.realBefore = before.realVersion
  return change
}

function compareVersions(a: string, b: string): number {
  let aParts = a.split('.').map(Number)
  let bParts = b.split('.').map(Number)
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

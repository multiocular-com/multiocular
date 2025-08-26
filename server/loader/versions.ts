import type { Change, ChangeId, Dependency } from '../types.ts'

function createChangeId(
  after: Dependency,
  before: Dependency | undefined
): ChangeId {
  if (before) {
    return `${after.type}:${after.name}@${before.version}>${after.version}` as ChangeId
  }
  return `${after.type}:${after.name}@${after.version}` as ChangeId
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
    return i.name === target.name && i.version === target.version
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
          // Until we have more types
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          i.type === after.type &&
          i.version !== after.version // Because later we will add after anyway
        )
      })

      if (candidates.length === 0) {
        changes.push({
          after: after.version,
          before: false,
          id: createChangeId(after, undefined),
          name: after.name,
          type: after.type
        })
        continue
      }

      // Sort all version by semver
      let allVersions = [...candidates, after].sort((a, b) => {
        return compareVersions(a.version, b.version)
      })

      // Find the after version position and get the previous element
      let afterIndex = allVersions.findIndex(v => v === after)
      let previous = afterIndex > 0 ? allVersions[afterIndex - 1] : undefined

      changes.push({
        after: after.version,
        before: previous ? previous.version : false,
        id: createChangeId(after, previous),
        name: after.name,
        type: after.type
      })
    }
  }

  return changes
}

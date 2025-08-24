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
      let candidates: Dependency[] = []

      for (let before of beforeVersions) {
        if (before.name === after.name) {
          if (!findMatching(afterVersions, before)) {
            candidates.push(before)
          }
        }
      }

      if (candidates.length === 0) {
        for (let before of beforeVersions) {
          if (before.name === after.name) {
            candidates.push(before)
          }
        }
      }

      let closest = candidates.sort((a, b) =>
        compareVersions(b.version, after.version)
      )[0]

      changes.push({
        after: after.version,
        before: closest ? closest.version : false,
        id: createChangeId(after, closest),
        name: after.name,
        type: after.type
      })
    }
  }

  return changes
}

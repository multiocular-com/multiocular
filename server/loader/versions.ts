import type { Change, ChangeId, Dependency } from '../types.ts'

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

      if (closest) {
        changes.push({
          after: after.version,
          before: closest.version,
          id: `${after.type}:${after.name}:${closest.version}>${after.version}` as ChangeId,
          name: after.name,
          type: after.type
        })
      }
    }
  }

  return changes
}

import type { parse } from 'diff2html'
import { atom, computed, map } from 'nanostores'

import type {
  ChangeId,
  ChangeLogTitle,
  Dependency,
  DependencyName,
  DependencyVersion,
  Diff,
  DiffSize,
  Markdown,
  RepositoryURL,
  SafeHTML
} from './types.ts'

export type StepValue = 'diffs' | 'done' | 'initialize' | 'versions'

export const $step = atom<StepValue>('initialize')

export type Change = {
  after: DependencyVersion
  before: DependencyVersion | false
  direct: boolean
  from: Dependency['from']
  id: ChangeId
  name: DependencyName
  realAfter?: string
  realBefore?: string
  repository?: RepositoryURL
  type: Dependency['type']
} & (
  | {
      size: DiffSize
      status: 'loaded' | 'reviewed'
    }
  | {
      status: 'loading'
    }
)

export const $changes = atom<Change[]>([])

export type ChangeDiffs = Record<ChangeId, Diff>
export const $diffs = map<ChangeDiffs>({})

export type FileDiff = ReturnType<typeof parse>[number]
export type FileDiffs = FileDiff[]
export type ChangeFileDiffs = Record<ChangeId, FileDiffs>
export const $fileDiffs = map<ChangeFileDiffs>({})

export type ChangeLog = [ChangeLogTitle, Markdown][]
export type ChangeLogs = Record<ChangeId, ChangeLog>
export const $changelogs = map<ChangeLogs>({})

export type ChangeLogHtml = [ChangeLogTitle, SafeHTML][]
export type ChangeLogHtmls = Record<ChangeId, ChangeLogHtml>
export const $changelogHtmls = map<ChangeLogHtmls>({})

export const $sortedChanges = computed($changes, changes =>
  [...changes].sort((a, b) => {
    if (a.status === 'loading' && b.status !== 'loading') return 1
    if (a.status !== 'loading' && b.status === 'loading') return -1
    return a.id.localeCompare(b.id)
  })
)

export interface ProgressItem {
  id: 'loading' | ChangeId
  part: number
  status: Change['status']
}

export const $progress = computed($sortedChanges, changes => {
  if (changes.length === 0) return []

  let loadingChanges = changes.filter(change => change.status === 'loading')
  let loadedChanges = changes.filter(change => change.status !== 'loading')

  let totalSize = loadedChanges.reduce((sum, change) => sum + change.size, 0)

  let loadingPart = (loadingChanges.length / changes.length) * 100
  let loadedPart = 100 - loadingPart

  let result: ProgressItem[] = []

  for (let change of changes) {
    if (change.status !== 'loading') {
      let part =
        totalSize > 0
          ? (change.size / totalSize) * loadedPart
          : loadedPart / loadedChanges.length
      result.push({
        id: change.id,
        part,
        status: change.status
      })
    }
  }
  if (loadingPart > 0) {
    result.push({
      id: 'loading',
      part: loadingPart,
      status: 'loading'
    })
  }

  return result
})

export function updateChange(id: ChangeId, update: Partial<Change>): void {
  $changes.set(
    $changes.get().map(change => {
      if (change.id === id) {
        return { ...change, ...update } as Change
      } else {
        return change
      }
    })
  )
}

export function getChangeId(
  type: Dependency['type'],
  name: DependencyName,
  before: DependencyVersion | false | undefined,
  after: DependencyVersion
): ChangeId {
  if (before) {
    return `${type}:${name}@${before}>${after}` as ChangeId
  } else {
    return `${type}:${name}@${after}` as ChangeId
  }
}

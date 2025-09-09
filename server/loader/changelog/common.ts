import type { Change, ChangeLog } from '../../../common/stores.ts'
import type {
  ChangeLogContent,
  ChangeLogTitle,
  DependencyVersion,
  FilePath
} from '../../../common/types.ts'

export interface ChangeLogLoader {
  (root: FilePath, change: Change): Promise<ChangeLog | null>
}

export const CHANGELOG_NAMES = [
  'CHANGELOG.md',
  'CHANGELOG.txt',
  'ChangeLog.md',
  'ChangeLog.txt',
  'changelog.md',
  'changelog.txt',
  'CHANGES',
  'CHANGES.md',
  'CHANGES.txt'
]

export function normalizeVersion(version: string): ChangeLogTitle {
  let versionMatch = version.match(/^\d+\.\d+(?:\.\d+)?(?:-[\w.]+)?/)
  if (versionMatch) {
    return versionMatch[0] as ChangeLogTitle
  } else {
    return version
      .trim()
      .replace(/^\s*v?/i, '')
      .replace(/\s.*$/, '') as ChangeLogTitle
  }
}

export function parseChangelog(content: string): ChangeLog {
  let lines = content.split('\n')
  let entries: ChangeLog = []
  let current: { content: string[]; title: string } | null = null

  for (let line of lines) {
    // Match version headers (## 1.2.3, ### v1.2.3, etc.)
    let versionMatch = line.match(
      /^#{2,3}\s*(?:v)?(\d+\.\d+\.\d+(?:\.\d+)?(?:-[\w.]+)?)\s*(.*)$/
    )
    if (versionMatch) {
      if (current) {
        entries.push([
          current.title as ChangeLogTitle,
          current.content.join('\n').trim() as ChangeLogContent
        ])
      }
      current = {
        content: [],
        title: normalizeVersion(versionMatch[1]!)
      }
    } else if (current && line.trim()) {
      current.content.push(line)
    }
  }

  if (current && current.content.length > 0) {
    entries.push([
      current.title as ChangeLogTitle,
      current.content.join('\n').trim() as ChangeLogContent
    ])
  }
  return entries
}

function isEqual(
  a: ChangeLogTitle | DependencyVersion,
  b: ChangeLogTitle | DependencyVersion
): boolean {
  return String(a) === String(b) || normalizeVersion(a) === normalizeVersion(b)
}

function parseVersion(
  version: ChangeLogTitle | DependencyVersion
): [number, number, number] {
  let [major, minor, patch] = version.split('.').map(i => parseInt(i))
  return [major ?? 0, minor ?? 0, patch ?? 0]
}

function isBetween(
  version: ChangeLogTitle,
  start: DependencyVersion,
  end: DependencyVersion
): boolean {
  let [startMajor, startMinor, startPatch] = parseVersion(start)
  let [endMajor, endMinor, endPatch] = parseVersion(end)
  let [versionMajor, versionMinor, versionPatch] = parseVersion(version)

  return (
    (versionMajor >= startMajor ||
      (versionMajor === startMajor && versionMinor >= startMinor) ||
      (versionMajor === startMajor &&
        versionMinor === startMinor &&
        versionPatch >= startPatch)) &&
    (versionMajor <= endMajor ||
      (versionMajor === endMajor && versionMinor <= endMinor) ||
      (versionMajor === endMajor &&
        versionMinor === endMinor &&
        versionPatch <= endPatch))
  )
}

export function filterChangelogByVersionRange(
  changelog: ChangeLog,
  after: DependencyVersion,
  before?: DependencyVersion | false
): ChangeLog {
  if (!before) return []
  let afterFound = false
  let filtered: ChangeLog = []
  for (let [version, content] of changelog) {
    if (isEqual(version, after)) afterFound = true
    if (afterFound) {
      if (isEqual(version, before)) break
      if (isBetween(version, before, after)) filtered.push([version, content])
    }
  }
  return filtered
}

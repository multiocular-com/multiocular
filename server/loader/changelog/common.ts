import type { Change, ChangeLog } from '../../../common/stores.ts'
import type {
  ChangeLogTitle,
  DependencyVersion,
  FilePath,
  Markdown
} from '../../../common/types.ts'
import { normalizeVersion, parseVersion } from '../versions.ts'

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

export function parseChangelog(content: string): ChangeLog {
  let lines = content.split('\n')
  let entries: ChangeLog = []
  let current: { content: string[]; title: string } | null = null

  for (let line of lines) {
    let versionMatch = line.match(
      /^#{2,3}\s+.*(\d+\.\d+\.\d+(?:\.\d+)?(?:-[\w.]+)?).*$/
    )
    if (versionMatch) {
      if (current) {
        entries.push([
          current.title as ChangeLogTitle,
          current.content.join('\n').trim() as Markdown
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
      current.content.join('\n').trim() as Markdown
    ])
  }
  return entries
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
    (versionMajor > startMajor ||
      (versionMajor === startMajor && versionMinor > startMinor) ||
      (versionMajor === startMajor &&
        versionMinor === startMinor &&
        versionPatch > startPatch)) &&
    (versionMajor < endMajor ||
      (versionMajor === endMajor && versionMinor < endMinor) ||
      (versionMajor === endMajor &&
        versionMinor === endMinor &&
        versionPatch <= endPatch))
  )
}

export function filterChangelogByVersionRange(
  text: false | string,
  parsed: ChangeLog,
  after: DependencyVersion,
  before?: DependencyVersion | false
): ChangeLog {
  if (!before) return []
  let filtered: ChangeLog = []
  for (let [version, content] of parsed) {
    if (isBetween(version, before, after)) filtered.push([version, content])
  }

  if (text && filtered.length === 0) {
    if (text.length < 1000) {
      return [['Changelog' as ChangeLogTitle, text as Markdown]]
    }
  }

  return filtered
}

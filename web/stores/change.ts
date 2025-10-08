import { computed, type ReadableAtom } from 'nanostores'

import { reviewChangeAction } from '../../common/api.ts'
import {
  $changes,
  type Change,
  type ChangeLogHtml
} from '../../common/stores.ts'
import type { ChangeId, DependencyVersion } from '../../common/types.ts'
import { client } from '../main/sync.ts'
import { getChangeUrl } from './router.ts'

export function getChange(id: ChangeId): ReadableAtom<Change> {
  let prevValue: Change | undefined
  return computed([$changes], changes => {
    let value = changes.find(i => i.id === id)
    if (value) {
      prevValue = value
      return value
    } else if (prevValue) {
      // Hack to fix Storybook <Scene> hack
      return prevValue
    } else {
      throw new Error('No change with this ID')
    }
  })
}

export function getChangeIndex(
  changes: readonly Change[],
  id: ChangeId
): string {
  return `${changes.findIndex(i => i.id === id) + 1}` + `/${changes.length}`
}

export function getNextUrl(changes: readonly Change[], id: ChangeId): string {
  let nextChange = changes[changes.findIndex(i => i.id === id) + 1]
  if (nextChange && nextChange.status === 'loaded') {
    return getChangeUrl(nextChange.id)
  } else {
    let unreviewed = changes.find(i => i.status === 'loaded')
    if (unreviewed && unreviewed.id !== id) {
      return getChangeUrl(unreviewed.id)
    } else {
      return '#finish'
    }
  }
}

export function reviewChange(
  id: ChangeId,
  value: Exclude<Change['status'], 'loading'>
): void {
  client.log.add(reviewChangeAction({ id, value }), { sync: true })
}

export type LoadingValue<Value> =
  | { isLoading: false; value: Value }
  | { isLoading: true }

export function getById<Value>(
  store: ReadableAtom<Record<ChangeId, Value>>,
  id: ChangeId
): ReadableAtom<LoadingValue<Value>> {
  return computed([store], values => {
    let value = values[id]
    if (value) {
      return { isLoading: false, value } as const
    } else {
      return { isLoading: true } as const
    }
  })
}

export function formatVersion(version: DependencyVersion): string {
  let match = version.match(/\/([a-f0-9]{40})$/)
  if (match) {
    return match[1]!.slice(0, 10)
  } else {
    return version
  }
}

export function hasChangelog(changelog: LoadingValue<ChangeLogHtml>): boolean {
  if (changelog.isLoading) {
    return true
  } else {
    return changelog.value.length > 0
  }
}

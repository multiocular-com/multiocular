import { atom, computed, type ReadableAtom } from 'nanostores'

import {
  $sortedChanges,
  $step,
  type Change,
  type StepValue
} from '../../common/stores.ts'
import type { ChangeId } from '../../common/types.ts'

export const $hash = atom<string>(location.hash.slice(1))

function updateHash(): void {
  $hash.set(location.hash.slice(1))
}

window.addEventListener('hashchange', updateHash)

export type Route =
  | { id: ChangeId; route: 'change' }
  | { route: 'finish' }
  | { route: 'home' }
  | { route: 'notFound' }

function parseHash(hash: string): Route {
  if (hash === '') {
    return { route: 'home' }
  } else if (hash === 'finish') {
    return { route: 'finish' }
  } else {
    let match = hash.match(/change\/(.+)/)
    if (match) {
      return { id: decodeURIComponent(match[1]!) as ChangeId, route: 'change' }
    } else {
      return { route: 'notFound' }
    }
  }
}
export const $router: ReadableAtom<Route> = computed($hash, parseHash)

export type Page =
  | { id: ChangeId; page: 'change' }
  | { page: 'empty' }
  | { page: 'finish' }
  | { page: 'notFound' }
  | { page: 'waiting' }

function redirect(route: Route, step: StepValue, changes: Change[]): Page {
  if (route.route === 'home') {
    if (step === 'initialize' || step === 'versions') {
      return { page: 'waiting' }
    } else if (changes[0]) {
      location.hash = getChangeUrl(changes[0].id)
      return { page: 'waiting' }
    } else {
      return { page: 'empty' }
    }
  } else if (route.route === 'change') {
    if (changes.some(change => change.id === route.id)) {
      return { id: route.id, page: 'change' }
    } else if (step !== 'done') {
      return { page: 'waiting' }
    } else {
      return { page: 'notFound' }
    }
  } else if (route.route === 'finish') {
    let unreviewed = changes.find(change => change.status === 'loaded')
    if (unreviewed) {
      location.hash = getChangeUrl(unreviewed.id)
    }
    return { page: route.route }
  } else {
    return { page: route.route }
  }
}
export const $page: ReadableAtom<Page> = computed(
  [$router, $step, $sortedChanges],
  redirect
)

export const $currentChangeId = computed($page, page => {
  if (page.page === 'change') {
    return page.id
  }
})

export function getChangeUrl(id: ChangeId): string {
  return `#change/${encodeURI(id)}`
}

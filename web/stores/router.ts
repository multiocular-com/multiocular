import { atom, computed, type ReadableAtom } from 'nanostores'

import {
  $sortedDiffs,
  $step,
  type ChangeDiff,
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
  | { route: 'home' }
  | { route: 'notFound' }
  | { route: 'settings' }

function parseHash(hash: string): Route {
  if (hash === '') {
    return { route: 'home' }
  } else if (hash === 'settings') {
    return { route: 'settings' }
  } else {
    let match = hash.match(/change\/([^/]+)/)
    if (match) {
      return { id: match[1]! as ChangeId, route: 'change' }
    } else {
      return { route: 'notFound' }
    }
  }
}
export const $router: ReadableAtom<Route> = computed($hash, parseHash)

export type Page =
  | { id: ChangeId; page: 'change' }
  | { page: 'empty' }
  | { page: 'notFound' }
  | { page: 'settings' }
  | { page: 'waiting' }

function redirect(route: Route, step: StepValue, diffs: ChangeDiff[]): Page {
  if (route.route === 'home') {
    if (step === 'initialize' || step === 'versions') {
      return { page: 'waiting' }
    } else if (diffs[0]) {
      return { id: diffs[0].id, page: 'change' }
    } else {
      return { page: 'empty' }
    }
  } else if (route.route === 'change') {
    if (diffs.some(diff => diff.id === route.id)) {
      return { page: 'notFound' }
    } else {
      return { id: route.id, page: 'change' }
    }
  } else {
    return { page: route.route }
  }
}
export const $page: ReadableAtom<Page> = computed(
  [$router, $step, $sortedDiffs],
  redirect
)

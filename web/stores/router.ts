import { atom, computed, type ReadableAtom } from 'nanostores'

import type { ChangeId } from '../../common/types.ts'

const $hash = atom<string>(location.hash.slice(1))

function updateHash(): void {
  $hash.set(location.hash.slice(1))
}

window.addEventListener('hashchange', updateHash)

export type Route =
  | { id: ChangeId; route: 'change' }
  | { route: 'home' }
  | { route: 'settings' }

function parseHash(hash: string): Route {
  if (hash === 'settings') {
    return { route: 'settings' }
  } else {
    let match = hash.match(/change\/([^/]+)/)
    if (match) {
      return { id: match[1]! as ChangeId, route: 'change' }
    } else {
      return { route: 'home' }
    }
  }
}

export const router: ReadableAtom<Route> = computed($hash, parseHash)

import { atom } from 'nanostores'

let media = window.matchMedia('(prefers-color-scheme: dark)')

export const $dark = atom(media.matches)

media.addEventListener('change', event => {
  $dark.set(event.matches)
})

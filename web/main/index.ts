import './sync.ts'

import './index.css'

import { pressKeyUX, startKeyUX } from 'keyux'
import { mount } from 'svelte'

import Main from './main.svelte'

mount(Main, { target: document.body })

startKeyUX(window, [pressKeyUX('is-pressed')])

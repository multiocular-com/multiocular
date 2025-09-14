import '../main/index.css'

import { withThemeByClassName } from '@storybook/addon-themes'
import type { Preview } from '@storybook/svelte'
import { INITIAL_VIEWPORTS, MINIMAL_VIEWPORTS } from 'storybook/viewport'

// @ts-expect-error Emulating Vite define
globalThis.__SERVER_URL__ = 'offline'

// @ts-expect-error Prevent stories update on version bump
globalThis.__MULTIOCULAR_VERSION__ = '0.0.0'

export default {
  decorators: [
    withThemeByClassName({
      defaultTheme: 'light',
      themes: {
        dark: 'is-dark',
        light: 'is-light'
      }
    })
  ],
  parameters: {
    viewport: {
      defaultViewport: 'responsive',
      viewports: {
        ...INITIAL_VIEWPORTS,
        ...MINIMAL_VIEWPORTS
      }
    }
  }
} satisfies Preview

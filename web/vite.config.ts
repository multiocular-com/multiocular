import { svelte } from '@sveltejs/vite-plugin-svelte'
import { join } from 'node:path'
import { defineConfig } from 'vite'

import { getVersion } from '../server/index.ts'

export default defineConfig(({ command }) => {
  return {
    build: {
      assetsInlineLimit: 0,
      cssMinify: false,
      emptyOutDir: true,
      minify: false,
      outDir: join(import.meta.dirname, '..', 'dist', 'web')
    },
    define: process.env.STORYBOOK
      ? {
          __MULTIOCULAR_VERSION__: '"0.0.0"',
          __SERVER_URL__: '"offline"'
        }
      : {
          __MULTIOCULAR_VERSION__: JSON.stringify(getVersion()),
          __SERVER_URL__: JSON.stringify(
            command === 'build' ? '' : 'ws://localhost:31337'
          )
        },
    plugins: [svelte()]
  }
})

import { svelte } from '@sveltejs/vite-plugin-svelte'
import { join } from 'node:path'
import { defineConfig } from 'vite'

import { getVersion } from '../server/index.ts'

export default defineConfig(({ command }) => ({
  build: {
    assetsInlineLimit: 0,
    cssMinify: false,
    emptyOutDir: true,
    minify: false,
    outDir: join(import.meta.dirname, '..', 'dist', 'web')
  },
  define: {
    __MULTIOCULAR_VERSION__: JSON.stringify(getVersion()),
    __SERVER_URL__: JSON.stringify(
      command === 'build' ? '' : 'ws://localhost:31337'
    )
  },
  plugins: [svelte()]
}))

import { svelte } from '@sveltejs/vite-plugin-svelte'
import { join } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig(({ command }) => ({
  build: {
    cssMinify: false,
    emptyOutDir: true,
    minify: false,
    outDir: join(import.meta.dirname, '..', 'dist', 'web')
  },
  define: {
    __SERVER_URL__: JSON.stringify(
      command === 'build' ? 'ws:///' : 'ws://localhost:31337'
    )
  },
  plugins: [svelte()]
}))

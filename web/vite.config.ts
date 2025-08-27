import { svelte } from '@sveltejs/vite-plugin-svelte'
import { join } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig(() => ({
  build: {
    emptyOutDir: true,
    outDir: join(import.meta.dirname, '..', 'dist', 'web')
  },
  plugins: [svelte()]
}))

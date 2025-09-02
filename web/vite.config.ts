import { svelte } from '@sveltejs/vite-plugin-svelte'
import { join } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig(() => ({
  build: {
    cssMinify: false,
    emptyOutDir: true,
    minify: false,
    outDir: join(import.meta.dirname, '..', 'dist', 'web')
  },
  plugins: [svelte()]
}))

import type { BaseServer } from '@logux/server'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import type { ServerResponse } from 'node:http'
import { extname, join, normalize } from 'node:path'

import { IS_DEV } from '../env.ts'

interface Asset {
  contentType: string
  data: Buffer
  headers: Record<string, string>
}

const ASSETS_DIR = IS_DEV
  ? join(import.meta.dirname, '..', 'dist', 'web')
  : join(import.meta.dirname, '..', 'web')

const MIME_TYPES: Record<string, string> = {
  '.avif': 'image/avif',
  '.css': 'text/css',
  '.html': 'text/html',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2'
}

const HASHED = /-[\w]{8}\.\w+$/

function send(res: ServerResponse, asset: Asset): void {
  for (let [header, value] of Object.entries(asset.headers)) {
    res.setHeader(header, value)
  }
  res.writeHead(200, { 'Content-Type': asset.contentType })
  res.end(asset.data)
}

const CONTENT_SECURITY_POLICIES = {
  'base-uri': "'none'",
  'form-action': "'none'",
  'frame-ancestors': "'none'",
  'object-src': "'none'",
  'script-src': "'self'",
  'style-src': "'self'"
} as const

export function serveAssets(server: BaseServer): void {
  let CACHE: Record<string, Asset> = {}

  server.http(async (req, res) => {
    if (req.method !== 'GET') return false

    let url = new URL(req.url!, `https://${req.headers.host}`)
    let pathname = url.pathname.replace(/\/$/, '')
    let safe = normalize(url.pathname).replace(/^(\.\.[/\\])+/, '')
    let cacheKey = safe
    let path = join(ASSETS_DIR, safe)

    if (!CACHE[cacheKey]) {
      if (path === '/') {
        let html = await readFile(join(ASSETS_DIR, 'index.html'))
        CACHE[cacheKey] = {
          contentType: 'text/html',
          data: html,
          headers: {
            'Content-Security-Policy': Object.entries(CONTENT_SECURITY_POLICIES)
              .map(([k, v]) => `${k} ${v}`)
              .join('; '),
            'Strict-Transport-Security':
              'max-age=31536000; includeSubDomains; preload',
            'X-Content-Type-Options': 'nosniff'
          }
        }
      } else {
        if (!existsSync(path)) return false
        let contentType =
          MIME_TYPES[extname(path)] || 'application/octet-stream'
        let data = await readFile(path)
        let headers: Asset['headers'] = {}
        if (pathname.includes('/assets/') && HASHED.test(path)) {
          headers['Cache-Control'] = 'public, max-age=31536000, immutable'
        }
        CACHE[cacheKey] = { contentType, data, headers }
      }
    }

    send(res, CACHE[cacheKey])
    return true
  })
}

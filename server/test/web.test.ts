import { strict as assert } from 'node:assert'
import { afterEach, beforeEach, test } from 'node:test'

import { IS_DEV } from '../env.ts'
import {
  killBackgroundProcess,
  removeProject,
  run,
  startInBackground,
  startProject
} from './utils.ts'

beforeEach(async () => {
  await startProject()
})

afterEach(async () => {
  await killBackgroundProcess()
  await removeProject()
})

test('starts web server with --web and makes HTTP requests', async () => {
  if (IS_DEV) await run(`cd ${import.meta.dirname} && node --run build:web`)
  await startInBackground(['--web'])

  let response = await fetch('http://localhost:31337/')
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('content-type'), 'text/html')
  let html = await response.text()
  assert.match(html, /<title>Multiocular<\/title>/)

  let jsMatch = html.match(/src="([^"]+)/)
  assert.ok(jsMatch, 'Should find script src in HTML')
  let jsPath = jsMatch[1]

  let jsResponse = await fetch(`http://localhost:31337${jsPath}`)
  assert.equal(jsResponse.status, 200)
  let csp = response.headers.get('content-security-policy') || ''
  assert.match(csp, /base-uri 'none'/)
  assert.match(csp, /script-src 'self'/)
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff')

  let notFoundResponse = await fetch('http://localhost:31337/nonexistent.js')
  assert.equal(notFoundResponse.status, 404)
})

test('shows correct port in output when using --port argument', async () => {
  let output = await startInBackground(['--web', '--port 8080'])
  assert.match(output, /8080/)
})

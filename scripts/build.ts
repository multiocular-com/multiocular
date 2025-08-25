#!/usr/bin/env node

import { spawn } from 'node:child_process'
import {
  copyFile,
  mkdir,
  readdir,
  readFile,
  rm,
  stat,
  writeFile
} from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'

const ROOT = join(import.meta.dirname, '..')
const DIST = join(ROOT, 'dist')
const IGNORE = new Set(['dist', 'docs', 'node_modules', 'scripts'])

function run(bin: string, ...args: string[]): Promise<void> {
  return new Promise(resolve => {
    let child = spawn(bin, args, {
      cwd: ROOT,
      env: process.env
    })
    child.on('close', () => {
      resolve()
    })
  })
}

async function replaceExtension(dir: string): Promise<void> {
  let entries = await readdir(dir)
  for (let entry of entries) {
    if (entry === 'node_modules' || entry === 'scripts') {
      continue
    }
    let path = join(dir, entry)
    let stats = await stat(path)
    if (stats.isDirectory()) {
      await replaceExtension(path)
    } else if (entry.endsWith('.ts')) {
      let content = await readFile(path, 'utf8')
      let fixedContent = content
        .replace(/from\s+['"]([^'"]+)\.ts['"]/g, "from '$1.js'")
        .replace(/import\s+['"]([^'"]+)\.ts['"]/g, "import '$1.js'")
        .replace(
          /export\s+\*\s+from\s+['"]([^'"]+)\.ts['"]/g,
          "export * from '$1.js'"
        )
        .replace(/export\s+{[^}]*}\s+from\s+['"]([^'"]+)\.ts['"]/g, match =>
          match.replace(/\.ts(['"])/, '.js$1')
        )
      await writeFile(path, fixedContent, 'utf8')
    }
  }
}

async function copyNonTsFiles(
  dir: string,
  from: string,
  to: string
): Promise<void> {
  let entries = await readdir(dir)
  for (let entry of entries) {
    if (IGNORE.has(entry)) {
      continue
    }
    let path = join(dir, entry)
    let stats = await stat(path)
    if (entry.startsWith('.') && stats.isDirectory()) continue
    if (stats.isDirectory()) {
      await copyNonTsFiles(path, from, to)
    } else if (!entry.endsWith('.ts')) {
      let relativePath = relative(from, path)
      let toPath = join(to, relativePath)
      await mkdir(dirname(toPath), { recursive: true })
      await copyFile(path, toPath)
    }
  }
}

async function preparePackageJson(): Promise<void> {
  let packageJson = JSON.parse(
    await readFile(join(ROOT, 'package.json'), 'utf8')
  )
  delete packageJson.devDependencies
  delete packageJson.scripts
  delete packageJson.pnpm
  await writeFile(
    join(DIST, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  )
  packageJson.bin = packageJson.bin.replace(/\.ts$/, '.js')
  for (let i in packageJson.exports) {
    packageJson.exports[i] = packageJson.exports[i].replace(/\.ts$/, '.js')
  }
  await copyFile(join(ROOT, '.npmignore'), join(DIST, '.npmignore'))
}

await rm(DIST, { force: true, recursive: true })
await run('pnpm', 'tsc', '--project', join(ROOT, 'tsconfig.build.json'))
await replaceExtension(DIST)
await copyNonTsFiles('.', ROOT, DIST)
await preparePackageJson()

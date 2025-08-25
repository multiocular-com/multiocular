#!/usr/bin/env node

import {
  chmod,
  copyFile,
  mkdir,
  readdir,
  readFile,
  rm,
  stat,
  writeFile
} from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import tsBlankSpace from 'ts-blank-space'

const ROOT = join(import.meta.dirname, '..')
const DIST = join(ROOT, 'dist')
const IGNORE = new Set(['dist', 'docs', 'node_modules', 'scripts'])

async function compileTypeScript(dir: string, to: string): Promise<void> {
  let entries = await readdir(dir)
  for (let entry of entries) {
    if (IGNORE.has(entry)) {
      continue
    }
    let path = join(dir, entry)
    let stats = await stat(path)
    if (stats.isDirectory()) {
      await compileTypeScript(path, to)
    } else if (entry.endsWith('.ts')) {
      let compiled = tsBlankSpace((await readFile(path)).toString())
        .replace(/from\s+['"]([^'"]+)\.ts['"]/g, "from '$1.js'")
        .replace(/import\s+['"]([^'"]+)\.ts['"]/g, "import '$1.js'")
        .replace(
          /export\s+\*\s+from\s+['"]([^'"]+)\.ts['"]/g,
          "export * from '$1.js'"
        )
        .replace(/export\s+{[^}]*}\s+from\s+['"]([^'"]+)\.ts['"]/g, match =>
          match.replace(/\.ts(['"])/, '.js$1')
        )
      let relativePath = relative(ROOT, path)
      let toPath = join(to, relativePath).replace(/\.ts$/, '.js')
      await mkdir(dirname(toPath), { recursive: true })
      await writeFile(toPath, compiled, 'utf8')
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
  packageJson.bin = packageJson.bin.replace(/\.ts$/, '.js')
  for (let i in packageJson.exports) {
    packageJson.exports[i] = packageJson.exports[i].replace(/\.ts$/, '.js')
  }
  await writeFile(
    join(DIST, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  )
}

await rm(DIST, { force: true, recursive: true })
await compileTypeScript('.', DIST)
await chmod(join(DIST, 'server', 'bin.js'), 0o755)
await copyNonTsFiles('.', ROOT, DIST)
await preparePackageJson()

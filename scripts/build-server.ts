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
const IGNORE = new Set([
  'CHANGELOG.md',
  'dist',
  'docs',
  'images',
  'node_modules',
  'scripts',
  'server/test',
  'storybook-static',
  'web'
])

type IgnoreFunction = (filePath: string) => boolean

async function loadNpmIgnorePatterns(): Promise<IgnoreFunction> {
  let npmIgnore = await readFile(join(ROOT, '.npmignore'), 'utf8')
  let patterns = npmIgnore
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))

  return (path: string): boolean => {
    let file = relative(ROOT, path)
    if (IGNORE.has(file)) return true
    return patterns.some(pattern => {
      if (pattern.endsWith('/')) {
        return file.startsWith(pattern) || file === pattern.slice(0, -1)
      }

      if (pattern.includes('*')) {
        let regexPattern = pattern.replace(/\./g, '\\.').replace(/\*/g, '.*')
        return new RegExp(`^${regexPattern}$`).test(file)
      }

      return file === pattern
    })
  }
}

async function compileTypeScript(
  dir: string,
  to: string,
  shouldIgnore: IgnoreFunction
): Promise<void> {
  let entries = await readdir(dir)
  for (let entry of entries) {
    let path = join(dir, entry)
    if (shouldIgnore(path)) continue
    let stats = await stat(path)
    if (stats.isDirectory()) {
      await compileTypeScript(path, to, shouldIgnore)
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
  to: string,
  shouldIgnore: IgnoreFunction
): Promise<void> {
  let entries = await readdir(dir)
  for (let entry of entries) {
    let path = join(dir, entry)
    if (shouldIgnore(path)) continue
    let stats = await stat(path)
    if (entry.startsWith('.') && stats.isDirectory()) continue
    if (stats.isDirectory()) {
      await copyNonTsFiles(path, from, to, shouldIgnore)
    } else if (!entry.endsWith('.ts')) {
      let toPath = join(to, relative(from, path))
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

const shouldIgnore = await loadNpmIgnorePatterns()
await rm(DIST, { force: true, recursive: true })
await compileTypeScript('server', DIST, shouldIgnore)
await compileTypeScript('common', DIST, shouldIgnore)
await chmod(join(DIST, 'server', 'bin.js'), 0o755)
await copyNonTsFiles('.', ROOT, DIST, shouldIgnore)
await preparePackageJson()

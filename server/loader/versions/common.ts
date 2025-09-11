import { basename } from 'node:path'

import type {
  Dependency,
  DependencyName,
  DependencyVersion,
  FilePath,
  LoadedFile
} from '../../../common/types.ts'

/**
 * Load versions list from changed files.
 */
export interface VersionsLoader {
  /**
   * Select files with versions (like lock files) from changed files.
   *
   * @param changed Changed files in commit or uncommited files.
   */
  findFiles(changed: FilePath[]): FilePath[]
  /**
   * Extract versions from file content.
   *
   * @param files Files selected at {@link VersionsLoader#findFiles}.
   */
  load(files: LoadedFile[]): Dependency[]
}

/**
 * Parse name and version in strings like:
 *
 * nanoid@5.0.0
 * @types/node@22.0.0
 * "@types/node@npm:22.0.0"
 */
export function splitPackage(pkg: string): {
  name: DependencyName
  version: DependencyVersion
} {
  // For yarn format
  if (pkg.startsWith('"') && pkg.endsWith('"')) {
    pkg = pkg.slice(1, -1)
  }
  pkg = pkg.replace('@npm:', '@')

  // Looking from the end to support scoped packaged like @types/node
  let lastAtIndex = pkg.lastIndexOf('@')
  if (lastAtIndex > 0) {
    return {
      name: pkg.substring(0, lastAtIndex) as DependencyName,
      version: pkg.substring(lastAtIndex + 1) as DependencyVersion
    }
  }
  return { name: pkg as DependencyName, version: '' as DependencyVersion }
}

export interface PackageJson {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

export function getDirectDependencies(
  packageJsonFiles: LoadedFile[]
): Set<string> {
  let directDeps = new Set<string>()

  for (let file of packageJsonFiles) {
    try {
      let pkg = JSON.parse(file.content) as PackageJson

      for (let dep in pkg.dependencies) {
        directDeps.add(dep)
      }
      for (let dep in pkg.devDependencies) {
        directDeps.add(dep)
      }
      for (let dep in pkg.peerDependencies) {
        directDeps.add(dep)
      }
      for (let dep in pkg.optionalDependencies) {
        directDeps.add(dep)
      }
    } catch {
      // Ignore invalid package.json files
    }
  }

  return directDeps
}

export function separateFiles(
  files: LoadedFile[],
  lockFileName: string
): {
  lockFiles: LoadedFile[]
  packageJsonFiles: LoadedFile[]
} {
  let lockFiles = files.filter(file => basename(file.path) === lockFileName)
  let packageJsonFiles = files.filter(
    file => basename(file.path) === 'package.json'
  )

  return { lockFiles, packageJsonFiles }
}

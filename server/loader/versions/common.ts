import type {
  Dependency,
  DependencyName,
  DependencyVersion,
  FilePath,
  LoadedFile
} from '../../types.ts'

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

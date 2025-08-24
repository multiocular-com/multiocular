import type { Dependency, FilePath, LoadedFile } from '../../types.ts'

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

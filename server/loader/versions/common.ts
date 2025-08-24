import type { Dependency, FilePath, LoadedFile } from '../../types.ts'

export interface VersionsLoader {
  findFiles(changed: FilePath[]): FilePath[]
  load(files: LoadedFile[]): Dependency[]
}

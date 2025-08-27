import type { Brand, Debrand } from '../utils/types.ts'

export type FilePath = Brand<string, 'FilePath'>
export type FileContent = Brand<string, 'FileContent'>
export type DependencyVersion = Brand<string, 'DependencyVersion'>
export type DependencyName = Brand<string, 'DependencyName'>
export type ChangeId = Brand<string, 'ChangeId'>
export type Diff = Brand<string, 'Diff'>
export type DiffSize = Brand<number, 'DiffSize'>

export type LoadedFile = { content: FileContent; path: FilePath }
export type MissingFile = { missing: true; path: FilePath }
export type File = LoadedFile | MissingFile

export function isLoaded(file: File): file is LoadedFile {
  return !('missing' in file)
}

export interface Dependency {
  from: 'github-actions' | 'npm' | 'pnpm' | 'yarn'
  name: DependencyName
  source: FilePath
  type: 'github-actions' | 'npm'
  version: DependencyVersion
}

export interface Change {
  after: DependencyVersion
  before: DependencyVersion | false
  from: Dependency['from']
  id: ChangeId
  name: DependencyName
  type: Dependency['type']
}

export type ChangeDiff = {
  diff: Diff
} & Change

export function filePath(value: string): FilePath {
  return value as FilePath
}

export function diff(value: string): Diff {
  return value as Diff
}

export function loadedFile(path: string, content: Buffer | string): LoadedFile {
  return { content: content.toString(), path } as LoadedFile
}

export function missingFile(path: string): MissingFile {
  return { missing: true, path } as MissingFile
}

export function dependency(object: Debrand<Dependency>): Dependency {
  return object as Dependency
}

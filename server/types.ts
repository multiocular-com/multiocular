import type { Brand } from '../utils/types.ts'

export type FilePath = Brand<string, 'FilePath'>
export type FileContent = Brand<string, 'FileContent'>
export type Version = Brand<string, 'Version'>
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
  name: DependencyName
  source: FilePath
  type: 'npm'
  version: Version
}

export interface Change {
  after: Version
  before: false | Version
  id: ChangeId
  name: DependencyName
  type: 'npm'
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

export function splitDependency(dependency: string): [DependencyName, Version] {
  let [name, version] = dependency.split('@')
  return [name as DependencyName, version as Version]
}

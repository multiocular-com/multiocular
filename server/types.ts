import type { Brand } from '../utils/types.ts'

export type FilePath = Brand<string, 'FilePath'>
export type FileContent = Brand<string, 'FileContent'>
export type Argument = Brand<string, 'Argument'>
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

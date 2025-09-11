import type { Change } from './stores.ts'

declare const __brand: unique symbol

declare const __extra: unique symbol

// Avoid using string for everything. With this fake __brand key we are adding
// branding types to TypeScript (like ID, Email, FilePath instead of string).
export type Brand<T, B> = { [__brand]: B } & T

// Utility type to remove branding and get the underlying type
export type Debrand<T> = T extends (infer U)[]
  ? Debrand<U>[]
  : T extends { [__brand]: any }
    ? T extends string
      ? string
      : T extends number
        ? number
        : { [K in keyof Omit<T, typeof __brand>]: Debrand<T[K]> }
    : T extends object
      ? { [K in keyof T]: Debrand<T[K]> }
      : T

export type FilePath = Brand<string, 'FilePath'>
export type FileContent = Brand<string, 'FileContent'>
export type DependencyVersion = Brand<string, 'DependencyVersion'>
export type DependencyName = Brand<string, 'DependencyName'>
export type ChangeId = Brand<string, 'ChangeId'>
export type Diff = Brand<string, 'Diff'>
export type DiffSize = Brand<number, 'DiffSize'>
export type ServerURL = Brand<string, 'ServerURL'>
export type RepositoryURL = Brand<string, 'RepositoryURL'>
export type GitHubRepositoryURL = { [__extra]: 'GitHub' } & RepositoryURL
export type GitHubRepository = { [__extra]: 'GitHub' } & DependencyName
export type ChangeLogTitle = Brand<string, 'ChangeLogTitle'>
export type Markdown = Brand<string, 'Markdown'>
export type SafeHTML = Brand<string, 'SafeHTML'>

export type LoadedFile = { content: FileContent; path: FilePath }
export type MissingFile = { missing: true; path: FilePath }
export type File = LoadedFile | MissingFile

export interface Dependency {
  from: 'github-actions' | 'npm' | 'pnpm' | 'yarn'
  name: DependencyName
  realVersion?: string
  source: FilePath
  type: 'github-actions' | 'npm'
  version: DependencyVersion
}

export function isLoaded(file: File): file is LoadedFile {
  return !('missing' in file)
}

export function filePathType(value: string): FilePath {
  return value as FilePath
}

export function diffType(value: string): Diff {
  return value as Diff
}

export function loadedFile(path: string, content: Buffer | string): LoadedFile {
  return { content: content.toString(), path } as LoadedFile
}

export function missingFile(path: string): MissingFile {
  return { missing: true, path } as MissingFile
}

export function dependencyType(object: Debrand<Dependency>): Dependency {
  return object as Dependency
}

export function changeType(object: Debrand<Change>): Change
export function changeType(object: Partial<Debrand<Change>>): Partial<Change>
export function changeType(
  object: Partial<Debrand<Change>>
): Change | Partial<Change> {
  return object as Change | Partial<Change>
}

export function serverURL(
  protocol: string,
  host: string,
  port: number
): ServerURL {
  return `${protocol}${host}:${port}/` as ServerURL
}

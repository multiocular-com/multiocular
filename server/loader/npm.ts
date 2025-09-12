import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Readable } from 'node:stream'
import { extract } from 'tar'

import {
  type DependencyName,
  type DependencyVersion,
  type FilePath,
  filePathType
} from '../../common/types.ts'

const DOWNLOADED_PACKAGES = new Map<string, FilePath>()

function isGitUrl(version: DependencyVersion): boolean {
  return (
    version.includes('git+') ||
    version.includes('github.com') ||
    version.includes('codeload.github.com')
  )
}

function parseGitUrl(version: DependencyVersion): null | string {
  if (version.includes('codeload.github.com')) {
    return version
  }

  let match = version.match(
    /git\+ssh:\/\/git@github\.com\/([^/]+\/[^/]+)\.git#(.+)/
  )
  if (match) {
    let [, repo, commit] = match
    return `https://codeload.github.com/${repo}/tar.gz/${commit}`
  }

  match = version.match(/^([^/]+\/[^#]+)#(.+)$/)
  if (match) {
    let [, repo, commit] = match
    return `https://codeload.github.com/${repo}/tar.gz/${commit}`
  }

  return null
}

function buildTarballUrl(
  name: DependencyName,
  version: DependencyVersion
): string {
  if (name.startsWith('@')) {
    // Scoped package: @scope/name -> @scope/name/-/name-version.tgz
    let nameWithoutScope = name.split('/')[1]!
    return `https://registry.npmjs.org/${name}/-/${nameWithoutScope}-${version}.tgz`
  } else {
    // Regular package: name -> name/-/name-version.tgz
    return `https://registry.npmjs.org/${name}/-/${name}-${version}.tgz`
  }
}

async function downloadTarball(url: string): Promise<ArrayBuffer> {
  let response = await fetch(url)
  if (!response.ok) {
    throw new Error(
      `Failed to download tarball from ${url}: ${response.status}`
    )
  }
  return response.arrayBuffer()
}

export async function getNpmContent(
  root: FilePath,
  name: DependencyName,
  version: DependencyVersion
): Promise<FilePath> {
  let spec = `${name}@${version}`
  if (!DOWNLOADED_PACKAGES.has(spec)) {
    let tarballUrl: string

    if (isGitUrl(version)) {
      let url = parseGitUrl(version)
      if (!url) {
        throw new Error(`Unsupported git URL format: ${version}`)
      }
      tarballUrl = url
    } else {
      tarballUrl = buildTarballUrl(name, version)
    }

    let tarballBuffer = await downloadTarball(tarballUrl)
    let tempDir = filePathType(await mkdtemp(join(tmpdir(), 'multiocular-')))

    await new Promise<void>((resolve, reject) => {
      let stream = Readable.from(Buffer.from(tarballBuffer))
      let extractor = extract({ cwd: tempDir, strip: 1 })
      extractor.on('error', reject)
      extractor.on('end', resolve)
      stream.pipe(extractor)
    })

    DOWNLOADED_PACKAGES.set(spec, tempDir)
  }
  return DOWNLOADED_PACKAGES.get(spec)!
}

let emptyPackage: FilePath | undefined

export async function createEmptyDir(): Promise<FilePath> {
  if (!emptyPackage) {
    emptyPackage = (await mkdtemp(join(tmpdir(), 'empty-npm-'))) as FilePath
  }
  return emptyPackage
}

export async function deleteTemporary(): Promise<void> {
  for (let folder of DOWNLOADED_PACKAGES.values()) {
    await rm(folder, { force: true, recursive: true })
  }
  if (emptyPackage) await rm(emptyPackage, { force: true, recursive: true })
  DOWNLOADED_PACKAGES.clear()
}

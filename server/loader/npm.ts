import Arborist from '@npmcli/arborist'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Readable } from 'node:stream'
import pacote, { type Options } from 'pacote'
import { extract } from 'tar'

import {
  type DependencyName,
  type DependencyVersion,
  type FilePath,
  filePathType
} from '../../common/types.ts'

const DOWNLOADED_PACKAGES = new Map<string, FilePath>()

export async function getNpmContent(
  root: FilePath,
  name: DependencyName,
  version: DependencyVersion,
  opts: Options = {}
): Promise<FilePath> {
  let spec = `${name}@${version}`
  if (!DOWNLOADED_PACKAGES.has(spec)) {
    let npmOpts = { ...opts, Arborist }
    let manifest = await pacote.manifest(spec, npmOpts)
    let tarballBuffer = await pacote.tarball(manifest._resolved, npmOpts)
    let tempDir = filePathType(await mkdtemp(join(tmpdir(), 'multiocular-')))
    await new Promise<void>((resolve, reject) => {
      let stream = Readable.from(tarballBuffer)
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

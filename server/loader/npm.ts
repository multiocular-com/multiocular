import Arborist from '@npmcli/arborist'
import { existsSync } from 'node:fs'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Readable } from 'node:stream'
import pacote, { type Options } from 'pacote'
import { extract } from 'tar'

import {
  type DependencyName,
  type DependencyVersion,
  filePath,
  type FilePath
} from '../../common/types.ts'

const OPENED_PACKAGES = new Map<string, FilePath>()
const DOWNLOADED_PACKAGES = new Map<string, FilePath>()

export async function getNpmContent(
  root: FilePath,
  name: DependencyName,
  version: DependencyVersion,
  opts: Options = {}
): Promise<FilePath> {
  let spec = `${name}@${version}`
  if (!OPENED_PACKAGES.has(spec)) {
    let localPath = filePath(join(root, 'node_modules', name))
    if (existsSync(localPath)) {
      let packageJsonPath = join(localPath, 'package.json')
      if (existsSync(packageJsonPath)) {
        let packageJson = JSON.parse(
          await readFile(packageJsonPath, 'utf-8')
        ) as { version: string }
        if (packageJson.version === version) {
          OPENED_PACKAGES.set(spec, localPath)
          return localPath
        }
      }
    }

    let npmOpts = {
      ...opts,
      Arborist
    }
    let manifest = await pacote.manifest(spec, npmOpts)
    let tarballBuffer = await pacote.tarball(manifest._resolved, npmOpts)
    let tempDir = filePath(await mkdtemp(join(tmpdir(), 'multiocular-')))
    await new Promise<void>((resolve, reject) => {
      let stream = Readable.from(tarballBuffer)
      let extractor = extract({
        cwd: tempDir,
        strip: 1
      })
      extractor.on('error', reject)
      extractor.on('end', resolve)
      stream.pipe(extractor)
    })
    OPENED_PACKAGES.set(spec, tempDir)
    DOWNLOADED_PACKAGES.set(spec, tempDir)
  }
  return OPENED_PACKAGES.get(spec)!
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
  OPENED_PACKAGES.clear()
}

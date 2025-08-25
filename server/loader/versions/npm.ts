import { basename } from 'node:path'

import { dependency, type Dependency } from '../../types.ts'
import type { VersionsLoader } from './common.ts'

interface NpmLock3 {
  lockfileVersion: number
  packages: Record<string, { version?: string }>
}

function isLockFile3(obj: unknown): obj is NpmLock3 {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'lockfileVersion' in obj &&
    typeof obj.lockfileVersion === 'number' &&
    obj.lockfileVersion === 3
  )
}

export const npm = {
  findFiles(changed) {
    return changed.filter(file => basename(file) === 'package-lock.json')
  },
  load(lockFiles) {
    let dependencies: Dependency[] = []

    for (let file of lockFiles) {
      let lock = JSON.parse(file.content)
      if (isLockFile3(lock)) {
        for (let packagePath in lock.packages) {
          if (packagePath === '' || !packagePath.startsWith('node_modules/')) {
            continue
          }

          let packageInfo = lock.packages[packagePath]
          if (!packageInfo?.version) {
            continue
          }

          let pathParts = packagePath.split('/')
          dependencies.push(
            dependency({
              name: pathParts.at(-1)!,
              source: file.path,
              type: 'npm',
              version: packageInfo.version
            })
          )
        }
      } else {
        throw new Error('Unknown npm lock file')
      }
    }

    return dependencies
  }
} satisfies VersionsLoader

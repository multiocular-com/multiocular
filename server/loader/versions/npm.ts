import { basename } from 'node:path'

import { dependency, type Dependency } from '../../../common/types.ts'
import { findRepositorySource, type VersionsLoader } from './common.ts'

interface NpmLock3 {
  lockfileVersion: number
  packages: Record<string, { resolved?: string; version?: string }>
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

          let version = packageInfo.version
          if (packageInfo.resolved?.includes('git+')) {
            version = packageInfo.resolved
          }

          let pathParts = packagePath.split('/')
          let name: string

          // Handle scoped packages like node_modules/@types/node
          if (
            pathParts.length >= 3 &&
            pathParts[pathParts.length - 2]!.startsWith('@')
          ) {
            name = `${pathParts[pathParts.length - 2]}/${pathParts[pathParts.length - 1]}`
          } else {
            name = pathParts.at(-1)!
          }

          dependencies.push(
            dependency({
              from: 'npm',
              name,
              repository: findRepositorySource(packageInfo.resolved, name),
              source: file.path,
              type: 'npm',
              version
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

import { basename } from 'node:path'
import { parse } from 'yaml'

import type { Dependency, DependencyName, Version } from '../../types.ts'
import type { VersionsLoader } from './common.ts'

interface PnpmLock9 {
  packages: Record<string, object>
}

function isLockFile9(obj: unknown): obj is PnpmLock9 {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'lockfileVersion' in obj &&
    typeof obj.lockfileVersion === 'string' &&
    obj.lockfileVersion.startsWith('9.')
  )
}

export const pnpm = {
  findFiles(changed) {
    return changed.filter(file => basename(file) === 'pnpm-lock.yaml')
  },
  load(lockFiles) {
    let dependencies: Dependency[] = []

    for (let file of lockFiles) {
      let lock = parse(file.content)
      if (isLockFile9(lock)) {
        for (let dependency in lock.packages) {
          let [name, version] = dependency.split('@')
          dependencies.push({
            name: name as DependencyName,
            source: file.path,
            type: 'npm',
            version: version as Version
          })
        }
      } else {
        throw new Error('Unknown pnpm lock file')
      }
    }

    return dependencies
  }
} satisfies VersionsLoader

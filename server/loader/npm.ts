import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

import type {
  DependencyName,
  DependencyVersion,
  FilePath
} from '../../common/types.ts'

export function findNpmRoot(
  root: FilePath,
  name: DependencyName,
  version: DependencyVersion
): FilePath | null {
  let visited = new Set<string>()
  return searchFromContext(root, name, version, visited)
}

function searchFromContext(
  contextPath: FilePath,
  name: DependencyName,
  version: DependencyVersion,
  visited: Set<string>
): FilePath | null {
  if (visited.has(contextPath)) return null
  visited.add(contextPath)

  try {
    let require = createRequire(pathToFileURL(join(contextPath, 'index.js')))
    let resolvedPath: string = ''
    try {
      resolvedPath = require.resolve(name)
    } catch {
      try {
        resolvedPath = require.resolve(name + '/package.json')
      } catch {
        let resolvePaths = require.resolve.paths(name)
        if (resolvePaths) {
          for (let searchPath of resolvePaths) {
            let potentialPath: string
            if (name.startsWith('@')) {
              let [scope, packageName] = name.split('/')
              potentialPath = join(searchPath, scope!, packageName!)
            } else {
              potentialPath = join(searchPath, name)
            }
            if (existsSync(potentialPath)) {
              let pkgJsonPath = join(potentialPath, 'package.json')
              if (existsSync(pkgJsonPath)) {
                resolvedPath = potentialPath
                break
              }
            }
          }
        }
      }
    }

    if (resolvedPath) {
      let packageRoot: FilePath | null
      if (resolvedPath.includes('/package.json')) {
        packageRoot = resolvedPath.replace('/package.json', '') as FilePath
      } else if (resolvedPath.includes(name)) {
        packageRoot = findPackageRoot(resolvedPath, name)
      } else {
        packageRoot = resolvedPath as FilePath
      }

      if (packageRoot && checkVersion(packageRoot, version)) {
        return packageRoot
      }
    }

    try {
      let packageJsonPath = join(contextPath, 'package.json')
      if (existsSync(packageJsonPath)) {
        let packageJson = JSON.parse(
          readFileSync(packageJsonPath, 'utf-8')
        ) as {
          dependencies?: Record<string, string>
          devDependencies?: Record<string, string>
        }

        let allDeps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies
        }

        for (let depName of Object.keys(allDeps)) {
          try {
            let depPath = require.resolve(depName)
            let depRoot = findPackageRoot(depPath, depName)

            if (depRoot) {
              try {
                let depRequire = createRequire(
                  pathToFileURL(join(depRoot, 'index.js'))
                )
                let depResolvedPath: string = ''

                try {
                  depResolvedPath = depRequire.resolve(name)
                } catch {
                  try {
                    depResolvedPath = depRequire.resolve(name + '/package.json')
                  } catch {
                    let paths = depRequire.resolve.paths(name)
                    if (paths) {
                      for (let searchPath of paths) {
                        let potentialPath: string
                        if (name.startsWith('@')) {
                          let [scope, packageName] = name.split('/')
                          potentialPath = join(searchPath, scope!, packageName!)
                        } else {
                          potentialPath = join(searchPath, name)
                        }
                        if (existsSync(potentialPath)) {
                          let pkgJsonPath = join(potentialPath, 'package.json')
                          if (existsSync(pkgJsonPath)) {
                            depResolvedPath = potentialPath
                            break
                          }
                        }
                      }
                    }
                  }
                }

                if (depResolvedPath) {
                  let targetRoot: FilePath | null
                  if (depResolvedPath.includes('/package.json')) {
                    targetRoot = depResolvedPath.replace(
                      '/package.json',
                      ''
                    ) as FilePath
                  } else if (depResolvedPath.includes(name)) {
                    targetRoot = findPackageRoot(depResolvedPath, name)
                  } else {
                    targetRoot = depResolvedPath as FilePath
                  }

                  if (targetRoot && checkVersion(targetRoot, version)) {
                    return targetRoot
                  }
                }
              } catch {}

              let result = searchFromContext(depRoot, name, version, visited)
              if (result) {
                return result
              }
            }
          } catch {}
        }
      }
    } catch {}
  } catch {}

  return null
}

function findPackageRoot(
  resolvedPath: string,
  packageName: string
): FilePath | null {
  if (packageName.startsWith('@')) {
    let [scope, name] = packageName.split('/')
    let segments = resolvedPath.split('/')
    for (let i = segments.length - 2; i >= 0; i--) {
      if (segments[i] === scope && segments[i + 1] === name) {
        return segments.slice(0, i + 2).join('/') as FilePath
      }
    }
  } else {
    let segments = resolvedPath.split('/')
    for (let i = segments.length - 1; i >= 0; i--) {
      if (segments[i] === packageName) {
        return segments.slice(0, i + 1).join('/') as FilePath
      }
    }
  }

  return null
}

function checkVersion(
  packageRoot: FilePath,
  expectedVersion: DependencyVersion
): boolean {
  let packageJsonPath = join(packageRoot, 'package.json')
  if (!existsSync(packageJsonPath)) {
    return false
  }

  try {
    let packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
      version: string
    }
    return packageJson.version === expectedVersion
  } catch {
    return false
  }
}

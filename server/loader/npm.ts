import { createRequire } from 'node:module'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

import type { DependencyName, FilePath } from '../../common/types.ts'

let require: ReturnType<typeof createRequire> | undefined

const PKG = '/package.json'

export function findNpmRoot(
  root: FilePath,
  name: DependencyName
): FilePath | null {
  require = createRequire(pathToFileURL(join(root, 'index.js')))
  let exportPath: string
  try {
    exportPath = require.resolve(name)
  } catch {
    try {
      exportPath = require.resolve(name + PKG)
    } catch {
      return null
    }
  }
  let index = exportPath.lastIndexOf(name)
  return exportPath.slice(0, index + name.length) as FilePath
}

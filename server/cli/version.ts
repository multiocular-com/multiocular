import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export function getVersion(): string {
  let packagePath = join(import.meta.dirname, '../../package.json')
  let packageData = JSON.parse(readFileSync(packagePath, 'utf-8')) as {
    version: string
  }
  return packageData.version
}

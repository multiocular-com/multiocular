import { styleText } from 'node:util'

import type { FilePath } from '../../common/types.ts'
import type { Config } from './args.ts'

export function print(message: string): void {
  process.stdout.write(message + '\n')
}

export function format(text: string): string {
  return text
    .replace(/`([^`]*)`/g, (_, content: string) => styleText('yellow', content))
    .replace(/\*([^*]*)\*/g, (_, content: string) => styleText('bold', content))
}

export function debug(message: string): void {
  process.stderr.write(styleText('gray', message) + '\n')
}

export function printError(message: string): void {
  process.stderr.write(
    styleText(['bgRed', 'bold'], ' ERROR ') +
      ' ' +
      styleText('red', message) +
      '\n'
  )
}

export function printDebugInfo(
  version: string,
  config: Config,
  root: FilePath
): void {
  debug(`Multiocular version: v${version}`)
  debug(`Node.js version: ${process.version}`)
  debug(`OS: ${process.platform}`)
  debug(`Root: ${root}`)
  debug('Config:' + JSON.stringify(config, null, 2) + '\n')
}

export function printUrl(port: number): void {
  print('')
  print(
    `  Multiocular UI: ` +
      styleText(['green', 'bold'], `http://localhost:${port}/`)
  )
  print('')
}

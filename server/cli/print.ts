import { styleText } from 'node:util'

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

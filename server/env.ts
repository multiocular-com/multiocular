import { extname } from 'node:path'

export const IS_DEV = extname(import.meta.filename) === '.ts'

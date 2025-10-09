import { existsSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'

import {
  $changes,
  type Change,
  onChangeUpdate,
  updateChangeStatus
} from '../../common/stores.ts'
import { type FilePath, filePathType } from '../../common/types.ts'
import { warn } from '../cli/print.ts'

export function getUserFolder(): FilePath {
  if (process.platform === 'win32') {
    return filePathType(join(homedir(), 'AppData', 'Local', 'multiocular'))
  } else if (process.platform === 'darwin') {
    return filePathType(
      join(homedir(), 'Library', 'Application Support', 'multiocular')
    )
  } else {
    return filePathType(join(homedir(), '.local', 'share', 'multiocular'))
  }
}

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[<>:"/\\|?*]/g, '_')
}

async function checkFileStatus(change: Change, file: string): Promise<void> {
  if (!existsSync(file)) {
    return
  }

  try {
    let content = await readFile(file, 'utf8')
    let [status, statusChangedAt] = content.split(',')
    if (status === 'reviewed' && statusChangedAt) {
      let timestamp = Number(statusChangedAt)
      updateChangeStatus(change.id, 'reviewed', timestamp)
    }
  } catch (error) {
    warn(`Failed to read file ${file}:`, String(error))
  }
}

export async function syncWithFileStorage(
  folder: false | FilePath
): Promise<void> {
  if (!folder) return

  try {
    await mkdir(folder, { recursive: true })
  } catch (error) {
    warn(`Failed to create folder ${folder}:`, String(error))
    return
  }

  onChangeUpdate(async (id, update) => {
    let file = join(folder, sanitizeFileName(id))

    if (update.status === 'reviewed' && update.statusChangedAt) {
      try {
        await writeFile(file, `${update.status},${update.statusChangedAt}`)
      } catch (error: unknown) {
        warn(`Failed to write file ${file}:`, String(error))
      }
    } else if (
      update.status &&
      update.statusChangedAt &&
      update.status !== 'reviewed' &&
      existsSync(file)
    ) {
      try {
        await rm(file)
      } catch (error: unknown) {
        warn(`Failed to remove file ${file}:`, String(error))
      }
    }
  })

  let checkedFiles = new Set<string>()
  $changes.subscribe(changes => {
    let changesToCheck: Change[] = []

    for (let change of changes) {
      if (!change.statusChangedAt) {
        if (!checkedFiles.has(change.id)) {
          checkedFiles.add(change.id)
          changesToCheck.push(change)
        }
      }
    }

    for (let change of changesToCheck) {
      checkFileStatus(change, join(folder, sanitizeFileName(change.id))).catch(
        (error: unknown) => {
          warn(`Failed to check file status for ${change.id}:`, String(error))
        }
      )
    }
  })
}

import { styleText } from 'node:util'

import {
  $changelogs,
  $diffs,
  $sortedChanges,
  $step,
  type Change
} from '../../common/stores.ts'
import type { Debrand } from '../../common/types.ts'
import type { Config } from './args.ts'
import { print } from './print.ts'

export type MultiocularJSON = Debrand<
  ({
    changelog: [string, string][]
    diff: string
  } & Omit<
    Extract<Change, { status: string }>,
    'id' | 'size' | 'status' | 'statusChangedAt'
  >)[]
>

function colorizedDiff(diffText: string): string {
  return diffText
    .split('\n')
    .map(line => {
      if (line.startsWith('+++') || line.startsWith('---')) {
        return styleText('yellow', line)
      } else if (line.startsWith('+')) {
        return styleText('green', line)
      } else if (line.startsWith('-')) {
        return styleText('red', line)
      }
      return line
    })
    .join('\n')
}

export function outputProcess(config: Config): void {
  let unbindStep = $step.subscribe(step => {
    if (step === 'done') {
      unbindStep()
      let changes = $sortedChanges
        .get()
        .filter(change => change.status !== 'loading')
      if (config.output === 'json') {
        let diffs = $diffs.get()
        let changelogs = $changelogs.get()
        let json = changes.map(change => ({
          after: change.after,
          before: change.before,
          changelog: changelogs[change.id]!,
          diff: diffs[change.id]!,
          direct: change.direct,
          from: change.from,
          name: change.name,
          repository: change.repository,
          type: change.type,
          update: change.update
        })) satisfies MultiocularJSON
        print(JSON.stringify(json, null, 2))
      } else if (config.output === 'text') {
        if (changes.length === 0) {
          print('No changes found')
        } else {
          let diffs = $diffs.get()
          for (let change of changes) {
            print(colorizedDiff(diffs[change.id]!))
          }
        }
      }
    }
  })
}

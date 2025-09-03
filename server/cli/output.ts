import { styleText } from 'node:util'

import { $sortedChanges, $step, type Change } from '../../common/stores.ts'
import type { Debrand } from '../../common/types.ts'
import type { Config } from './args.ts'
import { print } from './print.ts'

export type MultiocularJSON = Debrand<
  Omit<Extract<Change, { status: 'loaded' }>, 'id' | 'size' | 'status'>[]
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
  let unbindStep = $step.listen(step => {
    if (step === 'done') {
      unbindStep()
      let changes = $sortedChanges
        .get()
        .filter(change => change.status === 'loaded')
      if (config.output === 'json') {
        let json = changes.map(change => ({
          after: change.after,
          before: change.before,
          diff: change.diff,
          from: change.from,
          name: change.name,
          type: change.type
        })) satisfies MultiocularJSON
        print(JSON.stringify(json, null, 2))
      } else if (config.output === 'text') {
        if (changes.length === 0) {
          print('No changes found')
        } else {
          for (let change of changes) {
            print(colorizedDiff(change.diff))
          }
        }
      }
    }
  })
}

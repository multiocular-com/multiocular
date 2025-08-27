import { styleText } from 'node:util'

import type { Debrand } from '../../utils/types.ts'
import { $sortedDiffs, $step } from '../loader/stores.ts'
import type { ChangeDiff } from '../types.ts'
import type { Config } from './args.ts'
import { print } from './print.ts'

export type MultiocularJSON = Debrand<Omit<ChangeDiff, 'id'>[]>

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
      let diffs = $sortedDiffs.get()
      if (config.output === 'json') {
        let json = diffs.map(diff => ({
          after: diff.after,
          before: diff.before,
          diff: diff.diff,
          from: diff.from,
          name: diff.name,
          type: diff.type
        })) satisfies MultiocularJSON
        print(JSON.stringify(json, null, 2))
      } else if (config.output === 'text') {
        if (diffs.length === 0) {
          print('No changes found')
        } else {
          for (let diff of diffs) {
            print(colorizedDiff(diff.diff))
          }
        }
      }
    }
  })
}

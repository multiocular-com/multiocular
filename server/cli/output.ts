import type { Debrand } from '../../utils/types.ts'
import { $diffs, $step } from '../loader/stores.ts'
import type { ChangeDiff } from '../types.ts'
import type { Config } from './args.ts'
import { print } from './print.ts'

export type MultiocularJSON = Debrand<Omit<ChangeDiff, 'id'>[]>

export function outputProcess(config: Config): void {
  let unbindStep = $step.listen(step => {
    if (step === 'done') {
      unbindStep()
      if (config.output === 'json') {
        let json = $diffs.get().map(diff => ({
          after: diff.after,
          before: diff.before,
          diff: diff.diff,
          name: diff.name,
          type: diff.type
        })) satisfies MultiocularJSON
        print(JSON.stringify(json, null, 2))
      } else {
        for (let diff of $diffs.get()) {
          print(diff.diff)
        }
      }
    }
  })
}

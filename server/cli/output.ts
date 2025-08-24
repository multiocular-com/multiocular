import { $diffs, $step } from '../loader/stores.ts'
import type { ChangeDiff } from '../types.ts'
import type { Config } from './args.ts'
import { print } from './print.ts'

export type MultiocularJSON = ChangeDiff[]

export function outputProcess(config: Config): void {
  let unbindStep = $step.listen(step => {
    if (step === 'done') {
      unbindStep()
      if (config.output === 'json') {
        let json = $diffs.get() satisfies MultiocularJSON
        print(JSON.stringify(json, null, 2))
      } else {
        for (let diff of $diffs.get()) {
          print(diff.diff)
        }
      }
    }
  })
}

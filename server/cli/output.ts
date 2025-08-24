import { $diffs, $step } from '../loader/stores.ts'
import type { Config } from './args.ts'
import { print } from './print.ts'

export function outputProcess(config: Config): void {
  let unbindStep = $step.listen(step => {
    if (step === 'done') {
      unbindStep()
      if (config.output === 'json') {
        print(JSON.stringify($diffs.get(), null, 2))
      } else {
        for (let diff of $diffs.get()) {
          print(diff.diff)
        }
      }
    }
  })
}

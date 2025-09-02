import type { FilePath } from '../../common/types.ts'
import { isLoaded } from '../../common/types.ts'
import type { Config } from '../cli/args.ts'
import { diffLoaders } from './diffs/index.ts'
import { getChangedFiles, loadFile } from './git.ts'
import { $step, addDiff, declareUnloadedChanges } from './stores.ts'
import { calculateVersionDiff } from './versions.ts'
import { versionsLoaders } from './versions/index.ts'

export async function loadDiffs(root: FilePath, config: Config): Promise<void> {
  $step.set('versions')
  let beforeCommit: false | string
  let afterCommit: false | string

  if (config.source === 'changed') {
    beforeCommit = 'HEAD'
    afterCommit = false
  } else if (config.source === 'commit') {
    beforeCommit = `${config.commit}^`
    afterCommit = config.commit
  } else {
    beforeCommit = 'HEAD^'
    afterCommit = 'HEAD'
  }

  let changedRange = afterCommit ? `${beforeCommit} ${afterCommit}` : 'HEAD'
  let changed = await getChangedFiles(root, changedRange)
  let changes = (
    await Promise.all(
      Object.values(versionsLoaders).map(async loader => {
        let selected = loader.findFiles(changed)
        let [beforeContent, afterContent] = await Promise.all([
          Promise.all(selected.map(file => loadFile(root, beforeCommit, file))),
          Promise.all(selected.map(file => loadFile(root, afterCommit, file)))
        ])
        return calculateVersionDiff(
          loader.load(beforeContent.filter(isLoaded)),
          loader.load(afterContent.filter(isLoaded))
        )
      })
    )
  ).flat()

  declareUnloadedChanges(changes.map(i => i.id))
  $step.set('diffs')
  await Promise.all(
    changes.map(async change => {
      let diff = await diffLoaders[change.type](change)
      addDiff({ ...change, diff })
    })
  )

  $step.set('done')
}

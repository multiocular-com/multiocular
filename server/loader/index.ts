import type { Config } from '../cli/args.ts'
import type { FilePath } from '../types.ts'
import { isLoaded } from '../types.ts'
import { diffLoaders } from './diffs/index.ts'
import { getChangedFiles, loadFile } from './git.ts'
import { $step, addDiff, declareUnloadedChanges } from './stores.ts'
import { calculateVersionDiff } from './versions.ts'
import { versionsLoaders } from './versions/index.ts'

export async function loadDiffs(root: FilePath, config: Config): Promise<void> {
  let changedMode = config.mode === 'changed'

  $step.set('versions')
  let changed = await getChangedFiles(root, changedMode ? 'HEAD' : 'HEAD^ HEAD')
  let beforeCommit = changedMode ? 'HEAD' : 'HEAD^'
  let afterCommit = changedMode ? false : 'HEAD'
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

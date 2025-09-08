import {
  addDiffAction,
  replaceChangesAction,
  updateChangeAction
} from '../../common/api.ts'
import { $changes, $step, addDiff, updateChange } from '../../common/stores.ts'
import {
  change,
  type Diff,
  type DiffSize,
  type FilePath,
  isLoaded
} from '../../common/types.ts'
import type { Config } from '../cli/args.ts'
import { debug } from '../cli/print.ts'
import { send } from '../web/sync.ts'
import { diffLoaders } from './diffs/index.ts'
import { getChangedFiles, loadFile } from './git.ts'
import { calculateVersionDiff } from './versions.ts'
import { versionsLoaders } from './versions/index.ts'

function calcSize(str: string): DiffSize {
  return str.split('\n').filter(i => i.trim().length > 0).length as DiffSize
}

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
  let changed = await getChangedFiles(root, changedRange, config.debug)

  let changes = (
    await Promise.all(
      Object.values(versionsLoaders).map(async loader => {
        let selected = loader.findFiles(changed)
        let [beforeContent, afterContent] = await Promise.all([
          Promise.all(
            selected.map(f => loadFile(root, beforeCommit, f, config.debug))
          ),
          Promise.all(
            selected.map(f => loadFile(root, afterCommit, f, config.debug))
          )
        ])
        return calculateVersionDiff(
          loader.load(beforeContent.filter(isLoaded)),
          loader.load(afterContent.filter(isLoaded))
        )
      })
    )
  ).flat()

  if (config.debug) {
    debug('')
    debug('Found changes:')
    debug(JSON.stringify(changes, null, 2))
    debug('')
  }

  for (let changeItem of changes) {
    let repository = diffLoaders[changeItem.type].findRepository(changeItem)
    changeItem.repository = repository
  }

  $changes.set(changes)
  send(replaceChangesAction({ changes }))

  $step.set('diffs')
  await Promise.all(
    changes.map(async i => {
      let id = i.id
      let diff = await diffLoaders[i.type].loadDiff(i)
      if (diff.length > 1024 * 1024) {
        diff = ('The diff file is too big. It could be a binary. ' +
          'We will support it in next releases.') as Diff
      }
      addDiff(id, diff)
      send(addDiffAction({ diff, id }))
      let update = change({
        size: calcSize(diff),
        status: 'loaded'
      })
      updateChange(id, update)
      send(updateChangeAction({ id, update }))
    })
  )

  $step.set('done')
}

import { parse } from 'diff2html'

import {
  addChangelogAction,
  addFileDiffsAction,
  replaceChangesAction,
  updateChangeAction
} from '../../common/api.ts'
import {
  $changelogs,
  $changes,
  $diffs,
  $fileDiffs,
  $step,
  type ChangeLog,
  updateChange
} from '../../common/stores.ts'
import {
  change,
  type DiffSize,
  type FilePath,
  isLoaded
} from '../../common/types.ts'
import type { Config } from '../cli/args.ts'
import { debug } from '../cli/print.ts'
import { send } from '../web/sync.ts'
import { changelogLoaders } from './changelog/index.ts'
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

  await Promise.all(
    changes.map(async i => {
      i.repository = await diffLoaders[i.type].findRepository(root, i)
    })
  )

  $changes.set(changes)
  send(replaceChangesAction({ changes }))

  $step.set('diffs')
  await Promise.all([
    ...changes.map(async i => {
      let changelog: ChangeLog = []
      for (let loader of changelogLoaders) {
        let result = await loader(root, i)
        if (result !== null) {
          changelog = result
          break
        }
      }
      $changelogs.setKey(i.id, changelog)
      send(addChangelogAction({ changelog, id: i.id }))
    }),
    ...changes.map(async i => {
      let diff = await diffLoaders[i.type].loadDiff(root, i)
      let fileDiffs = parse(diff, {
        diffMaxLineLength: 20000,
        diffTooBigMessage: () =>
          'Diff is too big. See changes on project GitHub',
        renderNothingWhenEmpty: true
      })
      $diffs.setKey(i.id, diff)
      $fileDiffs.setKey(i.id, fileDiffs)
      send(addFileDiffsAction({ fileDiffs, id: i.id }))

      let update = change({
        size: calcSize(diff),
        status: 'loaded'
      })
      updateChange(i.id, update)
      send(updateChangeAction({ id: i.id, update }))
    })
  ])

  $step.set('done')
}

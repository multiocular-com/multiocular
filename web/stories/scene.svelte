<script lang="ts">
  import { parse } from 'diff2html'
  import type { Snippet } from 'svelte'

  import {
    type Change,
    type ChangeLogHtmls,
    $changelogHtmls as changelogHtmlsStore,
    $changes as changesStore,
    type FileDiffs,
    $fileDiffs as fileDiffsStore,
    getChangeId,
    $step as stepStore,
    type StepValue
  } from '../../common/stores.ts'
  import { changeType, type Debrand } from '../../common/types.ts'
  import { $dark as darkStore } from '../stores/dark.ts'
  import { $hash as hashStore } from '../stores/router.ts'

  function mockChange(partial: Partial<Debrand<Change>>): Change {
    let idless = changeType({
      after: '2.0.0',
      before: '1.0.0',
      direct: false,
      from: 'npm',
      id: '',
      name: 'mock-package',
      repository: 'https://www.npmjs.com/package/mock-package',
      size: 100,
      status: 'loaded',
      type: 'npm',
      ...partial
    })
    return {
      ...idless,
      id:
        idless.id ||
        getChangeId(idless.type, idless.name, idless.before, idless.after)
    }
  }

  let {
    changelogs = {},
    changes = [],
    children,
    diffs = {},
    hash = '',
    step = 'done'
  }: {
    changelogs?: Record<string, string[][]>
    changes?: Partial<Debrand<Change>>[]
    children: Snippet
    diffs?: Record<string, string>
    hash?: string
    step?: StepValue
  } = $props()

  $effect.pre(() => {
    let fileDiffs: Record<string, FileDiffs> = {}
    for (let k in diffs) fileDiffs[k] = parse(diffs[k]!)

    stepStore.set(step)
    changesStore.set(changes.map(i => mockChange(i)))
    hashStore.set(hash)
    fileDiffsStore.set(fileDiffs)
    changelogHtmlsStore.set(changelogs as ChangeLogHtmls)

    function updateTheme(): void {
      darkStore.set(document.documentElement.classList.contains('is-dark'))
    }
    updateTheme()
    let htmlObserver = new MutationObserver(() => {
      updateTheme()
    })
    htmlObserver.observe(document.documentElement, {
      attributeFilter: ['class'],
      attributes: true
    })

    return () => {
      hashStore.set('settings')
      stepStore.set('done')
      changesStore.set([])
      fileDiffsStore.set({})
      changelogHtmlsStore.set({})
      htmlObserver.disconnect()
    }
  })
</script>

{@render children()}

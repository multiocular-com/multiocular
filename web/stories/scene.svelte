<script lang="ts">
  import type { Snippet } from 'svelte'

  import {
    type Change,
    $changes as changesStore,
    getChangeId,
    $step as stepStore,
    type StepValue
  } from '../../common/stores.ts'
  import { change, type Debrand } from '../../common/types.ts'
  import { $hash as hashStore } from '../stores/router.ts'

  function mockChange(partial: Partial<Debrand<Change>>): Change {
    let idless = change({
      after: '2.0.0',
      before: '1.0.0',
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
    changes = [],
    children,
    hash = '',
    step = 'done'
  }: {
    changes?: Partial<Debrand<Change>>[]
    children: Snippet
    hash?: string
    step?: StepValue
  } = $props()

  $effect.pre(() => {
    stepStore.set(step)
    changesStore.set(changes.map(i => mockChange(i)))
    hashStore.set(hash)
  })
</script>

{@render children()}

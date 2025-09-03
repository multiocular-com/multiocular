<script lang="ts">
  import type { Snippet } from 'svelte'

  import {
    type Change,
    $changes as changesStore,
    $step as stepStore,
    type StepValue
  } from '../../common/stores.ts'
  import { $hash as hashStore } from '../stores/router.ts'

  let {
    changes = [],
    children,
    hash = '',
    step = 'initialize'
  }: {
    changes?: Change[]
    children: Snippet
    hash?: string
    step?: StepValue
  } = $props()

  $effect.pre(() => {
    hashStore.set(hash)
    stepStore.set(step)
    changesStore.set(changes)
  })
</script>

{@render children()}

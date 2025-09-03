<script lang="ts">
  import type { Snippet } from 'svelte'

  import { $step as stepStore, type StepValue } from '../../common/stores.ts'
  import { $hash as hashStore } from '../stores/router.ts'

  let {
    children,
    hash,
    step
  }: { children: Snippet; hash?: string; step?: StepValue } = $props()

  $effect.pre(() => {
    hashStore.set(hash ?? '')
    stepStore.set(step ?? 'initialize')
  })
</script>

{@render children()}

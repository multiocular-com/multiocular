<script lang="ts">
  import type { Snippet } from 'svelte'

  import { $step as stepStore, type StepValue } from '../../common/stores.ts'

  let { children, step }: { children: Snippet; step?: StepValue } = $props()

  $effect.pre(() => {
    if (step) stepStore.set(step)
  })
</script>

{@render children()}

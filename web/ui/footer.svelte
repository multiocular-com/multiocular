<script lang="ts">
  import type { Snippet } from 'svelte'

  import Panel from './panel.svelte'

  let { children }: { children?: Snippet } = $props()
</script>

<footer>
  <Panel position="bottom">
    {#if children}
      {@render children()}
    {/if}
  </Panel>
</footer>

<style>
  footer {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 2;
  }
</style>

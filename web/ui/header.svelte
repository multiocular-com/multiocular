<script lang="ts">
  import type { Snippet } from 'svelte'

  import Panel from './panel.svelte'

  let { children }: { children: Snippet } = $props()
</script>

<header>
  <Panel>
    {@render children()}
  </Panel>
</header>

<style>
  header {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 2;
  }
</style>

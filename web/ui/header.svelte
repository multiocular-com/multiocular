<script lang="ts">
  import type { Snippet } from 'svelte'

  let { children }: { children: Snippet } = $props()
</script>

<header>
  {@render children()}
</header>

<style>
  header {
    position: static;
    top: 0;
    right: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 2.2rem;
    box-shadow: var(--panel-shadow);
  }
</style>

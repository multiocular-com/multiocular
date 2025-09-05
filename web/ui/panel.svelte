<script lang="ts">
  import type { Snippet } from 'svelte'

  let { children }: { children: Snippet } = $props()
</script>

<div>
  {@render children()}
</div>

<style>
  div {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    height: var(--panel-height);
    padding: 0 0.2rem;
    background: var(--panel-color);
    box-shadow: var(--panel-shadow);
  }
</style>

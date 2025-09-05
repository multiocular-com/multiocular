<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    children,
    position
  }: { children: Snippet; position: 'bottom' | 'top' } = $props()
</script>

{#if position === 'top'}
  <header>
    {@render children()}
  </header>
{:else}
  <footer>
    {@render children()}
  </footer>
{/if}

<style>
  header,
  footer {
    position: fixed;
    right: 0;
    left: 0;
    z-index: 2;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    height: var(--panel-height);
    padding: 0 0.2rem;
    background: var(--panel-background);
    box-shadow: var(--panel-shadow);
  }

  header {
    top: 0;
  }

  footer {
    bottom: 0;
  }
</style>

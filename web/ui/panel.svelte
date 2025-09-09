<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    children,
    position
  }: { children?: Snippet; position: 'bottom' | 'top' } = $props()

  $effect(() => {
    if (position === 'bottom') {
      document.body.classList.add(`is-footer`)
      return () => {
        document.body.classList.remove(`is-footer`)
      }
    }
  })
</script>

{#if position === 'top'}
  <header>
    {@render children?.()}
  </header>
{:else}
  <footer>
    {@render children?.()}
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
  }

  header {
    top: 0;
    border-bottom: 1px solid var(--panel-border-color);
  }

  footer {
    bottom: 0;
    border-top: 1px solid var(--panel-border-color);
  }
</style>

<script lang="ts">
  import type { Snippet } from 'svelte'
  import { MediaQuery } from 'svelte/reactivity'

  let {
    children,
    maxWidth,
    padding,
    position
  }: {
    children: Snippet
    maxWidth?: number
    padding?: boolean
    position: 'left' | 'right'
  } = $props()

  let hide = $derived(
    maxWidth ? new MediaQuery(`(max-width: ${maxWidth}px)`) : undefined
  )

  $effect(() => {
    if (!hide?.current) {
      document.body.classList.add(`is-${position}-sidebar`)
    } else {
      document.body.classList.remove(`is-${position}-sidebar`)
    }
    return () => {
      document.body.classList.remove(`is-${position}-sidebar`)
    }
  })
</script>

{#if !hide?.current}
  <aside
    class:is-padding={padding}
    class:is-right={position === 'right'}
    tabindex="-1"
  >
    {@render children()}
  </aside>
{/if}

<style>
  aside {
    position: fixed;
    top: var(--panel-height);
    bottom: var(--panel-height);
    left: 0;
    z-index: 1;
    box-sizing: border-box;
    width: var(--sidebar-width);
    overflow: auto;
    background: var(--page-background);
    border-right: 1px solid var(--panel-border-color);

    &.is-right {
      right: 0;
      left: auto;
      border-right: none;
      border-left: 1px solid var(--panel-border-color);
    }

    &.is-padding {
      padding: var(--safe-padding);
    }
  }
</style>

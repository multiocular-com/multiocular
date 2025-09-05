<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    children,
    padding,
    position
  }: { children: Snippet; padding?: boolean; position: 'left' | 'right' } =
    $props()

  $effect(() => {
    document.body.classList.add(`is-${position}-sidebar`)
    return () => {
      document.body.classList.remove(`is-${position}-sidebar`)
    }
  })
</script>

<aside class:is-padding={padding} class:is-right={position === 'right'}>
  {@render children()}
</aside>

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
    background: var(--background-color);
    box-shadow: var(--panel-shadow);

    &.is-right {
      right: 0;
      left: auto;
    }

    &.is-padding {
      padding: var(--safe-padding);
    }
  }
</style>

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

<aside
  class:is-padding={padding}
  class:is-right={position === 'right'}
  tabindex="-1"
>
  {@render children()}
</aside>

<style>
  aside {
    position: fixed;
    /* stylelint-disable unit-disallowed-list */
    top: calc(var(--panel-height) + 1px);
    bottom: calc(var(--panel-height) + 1px);
    /* stylelint-enable unit-disallowed-list */
    left: 0;
    z-index: 1;
    box-sizing: border-box;
    width: var(--sidebar-width);
    overflow: auto;
    background: var(--page-background);
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

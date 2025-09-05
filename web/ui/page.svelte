<script lang="ts">
  import { onDestroy, onMount, type Snippet } from 'svelte'

  let {
    children,
    sidebars,
    title
  }: {
    children: Snippet
    sidebars?: boolean
    title: string
  } = $props()

  let baseTitle: string = ''

  function updateTitle(): void {
    document.title = `${title} › ${baseTitle}`
  }

  onMount(() => {
    baseTitle = document.title
    updateTitle()
  })

  onDestroy(() => {
    document.title = baseTitle
  })

  $effect(() => {
    updateTitle()
  })
</script>

<div class="page" class:is-sidebar={sidebars}>
  {@render children()}
</div>

<style>
  .page {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    padding-block: var(--panel-height);

    &.is-sidebar {
      padding-inline: var(--sidebar-width);
    }
  }
</style>

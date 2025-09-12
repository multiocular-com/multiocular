<script lang="ts">
  import { onDestroy, onMount, type Snippet } from 'svelte'

  let {
    children,
    title
  }: {
    children: Snippet
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

<div class="page">
  {@render children()}
</div>

<style>
  .page {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    height: calc(100vh);
    padding-top: var(--panel-height);

    :global(body.is-footer) & {
      padding-bottom: var(--panel-height);
    }

    :global(body.is-left-sidebar) & {
      padding-left: var(--sidebar-width);
    }

    :global(body.is-right-sidebar) & {
      padding-right: var(--sidebar-width);
    }
  }
</style>

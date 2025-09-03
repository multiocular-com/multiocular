<script lang="ts">
  import EmptyPage from '../pages/empty.svelte'
  import NotFoundPage from '../pages/not-found.svelte'
  import WaitingPage from '../pages/waiting.svelte'
  import { $page as pageStore } from '../stores/router.ts'
</script>

{#if $pageStore.page === 'notFound'}
  <NotFoundPage />
{:else if $pageStore.page === 'waiting'}
  <WaitingPage />
{:else if $pageStore.page === 'empty'}
  <EmptyPage />
{:else}
  {$pageStore.page}
{/if}

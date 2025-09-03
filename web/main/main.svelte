<script lang="ts">
  import NotFound from '../pages/not-found.svelte'
  import { $page as pageStore } from '../stores/router.ts'
</script>

{#if $pageStore.page === 'notFound'}
  <NotFound />
{:else}
  {$pageStore.page}
{/if}

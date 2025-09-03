<script lang="ts">
  import NotFound from '../pages/not-found.svelte'
  import { router } from '../stores/router.ts'
</script>

{#if $router.route === 'notFound'}
  <NotFound />
{:else}
  {$router.route}
{/if}

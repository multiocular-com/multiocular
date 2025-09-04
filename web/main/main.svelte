<script lang="ts">
  import ChangePage from '../pages/change.svelte'
  import EmptyPage from '../pages/empty.svelte'
  import NotFoundPage from '../pages/not-found.svelte'
  import SettingsPage from '../pages/settings.svelte'
  import WaitingPage from '../pages/waiting.svelte'
  import { $page as pageStore } from '../stores/router.ts'
</script>

{#if $pageStore.page === 'notFound'}
  <NotFoundPage />
{:else if $pageStore.page === 'waiting'}
  <WaitingPage />
{:else if $pageStore.page === 'empty'}
  <EmptyPage />
{:else if $pageStore.page === 'change'}
  <ChangePage id={$pageStore.id} />
{:else if $pageStore.page === 'settings'}
  <SettingsPage />
{/if}

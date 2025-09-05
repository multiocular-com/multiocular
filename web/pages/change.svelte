<script lang="ts">
  import { $changes as changesStore } from '../../common/stores.ts'
  import type { ChangeId } from '../../common/types.ts'
  import { getChange, getChangeIndex } from '../stores/change.ts'
  import Footer from '../ui/footer.svelte'
  import ProgressHeader from '../ui/headers/progress.svelte'
  import Page from '../ui/page.svelte'
  import Placeholder from '../ui/placeholder.svelte'
  import ChangesSidebar from '../ui/sidebars/changes.svelte'
  import DependencySidebar from '../ui/sidebars/dependency.svelte'

  let { id }: { id: ChangeId } = $props()

  let change = $derived(getChange(id))
</script>

{#if !$change.notFound}
  <Page
    sidebars
    title={$change.isLoading ? 'Wait' : getChangeIndex($changesStore, id)}
  >
    <ProgressHeader current={id} />
    <ChangesSidebar current={id} />
    {#if $change.isLoading}
      <Placeholder loading text="Loading diff…" />
    {:else}
      <DependencySidebar change={$change} />
      <Placeholder loading text="Loading diff…" />
    {/if}
    <Footer />
  </Page>
{/if}

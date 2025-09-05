<script lang="ts">
  import { $changes as changesStore } from '../../common/stores.ts'
  import type { ChangeId } from '../../common/types.ts'
  import { getChange, getChangeIndex } from '../stores/change.ts'
  import Footer from '../ui/footer.svelte'
  import ProgressHeader from '../ui/headers/progress.svelte'
  import Page from '../ui/page.svelte'
  import Placeholder from '../ui/placeholder.svelte'
  import ChangesSidebar from '../ui/sidebars/changes.svelte'

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
    <Placeholder loading text="Loading diff…" />
    <Footer />
  </Page>
{/if}

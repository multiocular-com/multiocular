<script lang="ts">
  import { $changes as changesStore } from '../../common/stores.ts'
  import type { ChangeId } from '../../common/types.ts'
  import { getChange, getChangeIndex } from '../stores/change.ts'
  import { getDiff } from '../stores/diff.ts'
  import Diff from '../ui/diff.svelte'
  import Footer from '../ui/footer.svelte'
  import ProgressHeader from '../ui/headers/progress.svelte'
  import Page from '../ui/page.svelte'
  import Placeholder from '../ui/placeholder.svelte'
  import ChangesSidebar from '../ui/sidebars/changes.svelte'
  import DependencySidebar from '../ui/sidebars/dependency.svelte'

  let { id }: { id: ChangeId } = $props()

  let change = $derived(getChange(id))
  let diff = $derived(getDiff(id))
</script>

<Page title={getChangeIndex($changesStore, id)}>
  <ProgressHeader current={id} />
  <ChangesSidebar current={id} />
  <DependencySidebar change={$change} />
  {#if $diff.isLoading}
    <Placeholder loading text="Loading diff…" />
  {:else}
    <Diff content={$diff.value} />
  {/if}
  <Footer />
</Page>

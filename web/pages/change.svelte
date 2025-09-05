<script lang="ts">
  import { $changes as changesStore } from '../../common/stores.ts'
  import type { ChangeId } from '../../common/types.ts'
  import { getChange, getChangeIndex, getNextChange } from '../stores/change.ts'
  import { getDiff } from '../stores/diff.ts'
  import { getChangeUrl } from '../stores/router.ts'
  import Diff from '../ui/diff.svelte'
  import ReviewFooter from '../ui/footers/review.svelte'
  import ProgressHeader from '../ui/headers/progress.svelte'
  import Page from '../ui/page.svelte'
  import Placeholder from '../ui/placeholder.svelte'
  import ChangesSidebar from '../ui/sidebars/changes.svelte'
  import DependencySidebar from '../ui/sidebars/dependency.svelte'

  let { id }: { id: ChangeId } = $props()

  let change = $derived(getChange(id))
  let diff = $derived(getDiff(id))
  let nextChange = $derived(getNextChange($changesStore, id))
  let next = $derived(nextChange ? getChangeUrl(nextChange.id) : undefined)
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
  <ReviewFooter {next} />
</Page>

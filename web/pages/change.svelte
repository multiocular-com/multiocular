<script lang="ts">
  import {
    $changelogs as changelogsStore,
    $changes as changesStore,
    $fileDiffs as fileDiffsStore
  } from '../../common/stores.ts'
  import type { ChangeId } from '../../common/types.ts'
  import {
    getById,
    getChange,
    getChangeIndex,
    getNextUrl
  } from '../stores/change.ts'
  import Changelog from '../ui/changelog.svelte'
  import Dependency from '../ui/dependency.svelte'
  import Diff from '../ui/diff.svelte'
  import ReviewFooter from '../ui/footers/review.svelte'
  import ProgressHeader from '../ui/headers/progress.svelte'
  import InlinePlaceholder from '../ui/inline-placeholder.svelte'
  import Page from '../ui/page.svelte'
  import ChangesSidebar from '../ui/sidebars/changes.svelte'
  import FilesSidebar from '../ui/sidebars/files.svelte'

  let { id }: { id: ChangeId } = $props()

  let change = $derived(getChange(id))
  let fileDiffs = $derived(getById(fileDiffsStore, id))
  let changelog = $derived(getById(changelogsStore, id))
  let next = $derived(getNextUrl($changesStore, id))
</script>

<Page title={getChangeIndex($changesStore, id)}>
  <ProgressHeader current={id} />
  <ChangesSidebar current={id} />
  <FilesSidebar content={$fileDiffs} />
  <Dependency change={$change} />
  {#if $change.before}
    {#if $changelog.isLoading}
      <InlinePlaceholder text="Loading changelog…" />
    {:else}
      <Changelog content={$changelog.value} />
    {/if}
  {/if}
  {#if $fileDiffs.isLoading}
    <InlinePlaceholder text="Loading diff…" />
  {:else}
    <Diff content={$fileDiffs.value} />
  {/if}
  <ReviewFooter current={id} {next} status={$change.status} />
</Page>

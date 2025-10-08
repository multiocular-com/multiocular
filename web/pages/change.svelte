<script lang="ts">
  import {
    $changelogHtmls as changelogHtmlsStore,
    $fileDiffs as fileDiffsStore,
    $sortedChanges as sortedChangesStore
  } from '../../common/stores.ts'
  import type { ChangeId } from '../../common/types.ts'
  import {
    getById,
    getChange,
    getChangeIndex,
    getNextUrl,
    hasChangelog
  } from '../stores/change.ts'
  import Changelog from '../ui/changelog.svelte'
  import Dependency from '../ui/dependency.svelte'
  import Diff from '../ui/diff.svelte'
  import ReviewFooter from '../ui/footers/review.svelte'
  import ProgressHeader from '../ui/headers/progress.svelte'
  import InlinePlaceholder from '../ui/inline-placeholder.svelte'
  import Main from '../ui/main.svelte'
  import Page from '../ui/page.svelte'
  import ChangesSidebar from '../ui/sidebars/changes.svelte'
  import FilesSidebar from '../ui/sidebars/files.svelte'

  let { id }: { id: ChangeId } = $props()

  let change = $derived(getChange(id))
  let fileDiffs = $derived(getById(fileDiffsStore, id))
  let changelog = $derived(getById(changelogHtmlsStore, id))
  let next = $derived(getNextUrl($sortedChangesStore, id))
</script>

<Page title={getChangeIndex($sortedChangesStore, id)}>
  <ProgressHeader current={id} />
  <ChangesSidebar current={id} />
  <FilesSidebar
    content={$fileDiffs}
    hasChanelog={$change.before && hasChangelog($changelog)}
  />
  <Main>
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
  </Main>
  <ReviewFooter current={id} {next} status={$change.status} />
</Page>

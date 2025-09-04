<script lang="ts">
  import type { ChangeId } from '../../common/types.ts'
  import { getChange } from '../stores/change.ts'
  import Footer from '../ui/footer.svelte'
  import Page from '../ui/page.svelte'
  import ProgressHeader from '../ui/progress-header.svelte'

  let { id }: { id: ChangeId } = $props()

  let change = $derived(getChange(id))
</script>

{#if !$change.notFound}
  <Page title={$change.isLoading ? 'Wait' : $change.name}>
    <ProgressHeader />
    <Footer />
  </Page>
{/if}

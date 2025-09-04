<script lang="ts">
  import { $changes as changesStore } from '../../common/stores.ts'
  import type { ChangeId } from '../../common/types.ts'
  import { getChange, getChangeIndex } from '../stores/change.ts'
  import ChangesNavbar from '../ui/changes-navbar.svelte'
  import Footer from '../ui/footer.svelte'
  import Page from '../ui/page.svelte'
  import ProgressHeader from '../ui/progress-header.svelte'

  let { id }: { id: ChangeId } = $props()

  let change = $derived(getChange(id))
</script>

{#if !$change.notFound}
  <Page title={$change.isLoading ? 'Wait' : getChangeIndex($changesStore, id)}>
    <ProgressHeader current={id} />
    <ChangesNavbar current={id} />
    <Footer />
  </Page>
{/if}

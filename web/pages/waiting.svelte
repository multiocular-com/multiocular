<script lang="ts">
  import Footer from '../ui/footer.svelte'
  import ProgressHeader from '../ui/headers/progress.svelte'
  import Page from '../ui/page.svelte'
  import Placeholder from '../ui/placeholder.svelte'
</script>

<Page title="Wait">
  <ProgressHeader />
  <Placeholder loading text="Extracting Diffs…" />
  <Footer />
</Page>

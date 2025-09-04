<script lang="ts">
  import Footer from '../ui/footer.svelte'
  import Page from '../ui/page.svelte'
  import Placeholder from '../ui/placeholder.svelte'
  import ProgressHeader from '../ui/progress-header.svelte'
</script>

<Page title="Wait">
  <ProgressHeader />
  <Placeholder text="Extracting Diffs…" />
  <Footer />
</Page>

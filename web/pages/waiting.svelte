<script lang="ts">
  import Page from '../ui/page.svelte'
  import Placeholder from '../ui/placeholder.svelte'
  import Progress from '../ui/progress.svelte'
</script>

<Page title="Wait">
  <Progress />
  <Placeholder text="Extracting Diffs…" />
</Page>

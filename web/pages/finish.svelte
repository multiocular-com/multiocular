<script lang="ts">
  import ReviewFooter from '../ui/footers/review.svelte'
  import ProgressHeader from '../ui/headers/progress.svelte'
  import Page from '../ui/page.svelte'
  import Placeholder from '../ui/placeholder.svelte'
</script>

<Page title="Wait">
  <ProgressHeader finish />
  <Placeholder text="All changes reviewed" />
  <ReviewFooter disabled />
</Page>

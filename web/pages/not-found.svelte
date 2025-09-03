<script lang="ts">
  import Header from '../ui/header.svelte'
  import Home from '../ui/home.svelte'
  import Page from '../ui/page.svelte'
  import Placeholder from '../ui/placeholder.svelte'
</script>

<Page title="404">
  <Header>
    <Home />
  </Header>
  <Placeholder text="Not Found" />
</Page>

<script lang="ts">
  import Header from '../ui/header.svelte'
  import Logo from '../ui/logo.svelte'
  import Page from '../ui/page.svelte'
</script>

<Page title="404">
  <Header>
    <Logo />
  </Header>
  <main class="center">
    <h1>Not Found</h1>
  </main>
</Page>

<style>
  .center {
    display: flex;
    flex-grow: 1;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 500;
  }
</style>

<script lang="ts">
  import Button from './button.svelte'
  import Header from './header.svelte'
  import Home from './home.svelte'
</script>

<Header>
  <div class="center">
    <div>
      <Home name href="#" />
      <Button
        href="https://github.com/multiocular-com/multiocular/releases"
        target="_blank"
      >
        {__MULTIOCULAR_VERSION__}
      </Button>
    </div>
    <div>
      <Button
        href="https://github.com/multiocular-com/multiocular"
        target="_blank"
      >
        GitHub
      </Button>
    </div>
  </div>
</Header>

<style>
  div {
    display: flex;
    gap: 0.25rem;
  }

  .center {
    justify-content: space-between;
    width: var(--page-width);
    max-width: 100%;
  }
</style>

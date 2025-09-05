<script lang="ts">
  import Button from './button.svelte'
  import Header from './header.svelte'
  import Home from './home.svelte'
  import GithubIcon from './icons/github.svelte'
</script>

<Header>
  <div class="center">
    <div>
      <Home name href="#" />
      <Button
        href="https://github.com/multiocular-com/multiocular/releases"
        target="_blank"
        title="Change log"
      >
        {__MULTIOCULAR_VERSION__}
      </Button>
    </div>
    <div>
      <Button
        href="https://github.com/multiocular-com/multiocular"
        target="_blank"
      >
        <GithubIcon />
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

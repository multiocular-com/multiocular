<script lang="ts">
  import type { Change } from '../../../common/stores.ts'
  import Button from '../button.svelte'
  import GithubIcon from '../icons/github.svelte'
  import Sidebar from '../sidebar.svelte'

  let { change }: { change: Change } = $props()
</script>

<Sidebar padding position="right">
  <h1>{change.name}</h1>
  <Button href={change.repository} size="big" target="_blank">
    {#if change.repository.startsWith('https://github.com/')}
      <GithubIcon />
    {/if}
    Repository
  </Button>
</Sidebar>

<style>
  h1 {
    margin-bottom: 1rem;
    font: var(--title-font);
    overflow-wrap: break-word;
  }
</style>

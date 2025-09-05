<script lang="ts">
  import type { Change } from '../../../common/stores.ts'
  import Button from '../button.svelte'
  import GithubIcon from '../icons/github.svelte'
  import Sidebar from '../sidebar.svelte'

  let { change }: { change: Change } = $props()
</script>

<Sidebar padding position="right">
  <Button href={change.repository} size="wide">
    {#if change.repository.startsWith('https://github.com/')}
      <GithubIcon />
    {/if}
    Repository
  </Button>
</Sidebar>

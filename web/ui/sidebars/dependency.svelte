<script lang="ts">
  import { mdiOpenInNew } from '@mdi/js'

  import type { Change } from '../../../common/stores.ts'
  import Button from '../button.svelte'
  import Icon from '../icon.svelte'
  import { github } from '../icons/github.ts'
  import Sidebar from '../sidebar.svelte'

  let { change }: { change: Change } = $props()
</script>

<Sidebar padding position="right">
  <h1>{change.name}</h1>
  <Button href={change.repository} size="big" target="_blank">
    {#if change.repository.startsWith('https://github.com/')}
      <Icon path={github} />
      Repository
    {:else}
      <Icon path={mdiOpenInNew} />
      Project link
    {/if}
  </Button>
</Sidebar>

<style>
  h1 {
    margin: 0.2rem 0 0.7rem;
    font: var(--title-font);
    overflow-wrap: break-word;
  }
</style>

<script lang="ts">
  import { mdiOpenInNew } from '@mdi/js'

  import type { Change } from '../../common/stores.ts'
  import Button from './button.svelte'
  import Icon from './icon.svelte'
  import { github } from './icons/github.ts'

  let { change }: { change: Change } = $props()
</script>

<section>
  <h1>{change.name}</h1>
  {#if change.repository}
    <Button href={change.repository} target="_blank">
      {#if change.repository.startsWith('https://github.com/')}
        <Icon path={github} />
        Repository
      {:else}
        <Icon path={mdiOpenInNew} />
        Project link
      {/if}
    </Button>
  {/if}
</section>

<style>
  section {
    display: flex;
    align-items: last baseline;
    padding: var(--safe-padding);
  }

  h1 {
    flex-grow: 1;
    font: var(--base-font);
    overflow-wrap: break-word;
  }
</style>

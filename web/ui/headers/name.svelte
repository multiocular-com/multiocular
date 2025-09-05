<script lang="ts">
  import { mdiTagMultipleOutline } from '@mdi/js'

  import Button from '../button.svelte'
  import Home from '../home.svelte'
  import Icon from '../icon.svelte'
  import { github } from '../icons/github.ts'
  import Panel from '../panel.svelte'
</script>

<Panel position="top">
  <div class="center">
    <div>
      <Home name href="#" />
      <Button
        href="https://github.com/multiocular-com/multiocular/releases"
        target="_blank"
        title="Change log"
      >
        <Icon path={mdiTagMultipleOutline} />
        {__MULTIOCULAR_VERSION__}
      </Button>
    </div>
    <div>
      <Button
        href="https://github.com/multiocular-com/multiocular"
        target="_blank"
      >
        <Icon path={github} />
        GitHub
      </Button>
    </div>
  </div>
</Panel>

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

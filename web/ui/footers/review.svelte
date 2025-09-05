<script lang="ts">
  import { mdiArrowRightThick } from '@mdi/js'

  import Button from '../button.svelte'
  import Icon from '../icon.svelte'
  import Panel from '../panel.svelte'

  let { next }: { next?: string } = $props()
</script>

<Panel position="bottom">
  <div class="center">
    <Button disabled={!next} href={next ?? '#'} variant="approve">
      <Icon path={mdiArrowRightThick} />
      Next change
    </Button>
  </div>
</Panel>

<style>
  .center {
    display: flex;
    flex-grow: 1;
    justify-content: flex-end;
    margin-inline: var(--sidebar-width);
  }
</style>

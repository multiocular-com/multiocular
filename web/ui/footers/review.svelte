<script lang="ts">
  import { mdiCheckCircle } from '@mdi/js'

  import type { ChangeId } from '../../../common/types.ts'
  import { reviewChange } from '../../stores/change.ts'
  import Button from '../button.svelte'
  import Icon from '../icon.svelte'
  import Panel from '../panel.svelte'

  let {
    current,
    disabled,
    next
  }:
    | { current: ChangeId; disabled?: false; next?: string }
    | { current?: undefined; disabled: true; next?: undefined } = $props()
</script>

<Panel position="bottom">
  <div class="center">
    <Button
      {disabled}
      onclick={() => {
        if (current) {
          reviewChange(current, 'reviewed')
          location.hash = next ?? '#finish'
        }
      }}
      variant="approve"
    >
      <Icon path={mdiCheckCircle} />
      Review
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

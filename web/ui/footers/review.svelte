<script lang="ts">
  import { mdiArrowRightThick, mdiCheckCircle, mdiUndo } from '@mdi/js'

  import type { Change } from '../../../common/stores.ts'
  import type { ChangeId } from '../../../common/types.ts'
  import { reviewChange } from '../../stores/change.ts'
  import Button from '../button.svelte'
  import Icon from '../icon.svelte'
  import Panel from '../panel.svelte'

  let {
    current,
    disabled,
    next,
    status
  }:
    | {
        current: ChangeId
        disabled?: false
        next?: string
        status: Change['status']
      }
    | {
        current?: undefined
        disabled: true
        next?: undefined
        status?: undefined
      } = $props()
</script>

<Panel position="bottom">
  <div class="center">
    {#if status === 'loaded'}
      <Button
        {disabled}
        onclick={() => {
          if (current) {
            location.hash = next ?? '#finish'
            let reviewing = current
            setTimeout(() => {
              reviewChange(reviewing, 'reviewed')
            }, 100)
          }
        }}
        variant="approve"
      >
        <Icon path={mdiCheckCircle} />
        Review
      </Button>
    {:else}
      <Button
        {disabled}
        onclick={() => {
          if (current) {
            reviewChange(current, 'loaded')
          }
        }}
      >
        <Icon path={mdiUndo} />
        Unreview
      </Button>
      <Button {disabled} href={next ?? '#finish'} variant="approve">
        <Icon path={mdiArrowRightThick} />
        Next change
      </Button>
    {/if}
  </div>
</Panel>

<style>
  .center {
    display: flex;
    flex-grow: 1;
    gap: 0.5rem;
    justify-content: flex-end;
    margin-inline: var(--sidebar-width);
  }
</style>

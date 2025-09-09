<script lang="ts">
  import {
    $progress as progressStore,
    $step as stepStore
  } from '../../../common/stores.ts'
  import type { ChangeId } from '../../../common/types.ts'
  import { getChangeUrl } from '../../stores/router.ts'
  import Home from '../../ui/home.svelte'
  import Loading from '../../ui/loading.svelte'
  import Panel from '../panel.svelte'

  let {
    current,
    finish
  }:
    | { current?: ChangeId; finish?: false }
    | { current?: undefined; finish: true } = $props()

  let currentIndex = $derived($progressStore.findIndex(i => i.id === current))
  let moveEyes = $derived(
    finish
      ? 100
      : $progressStore
          .slice(0, currentIndex)
          .reduce((sum, i) => sum + i.part, 0)
  )
</script>

<Panel position="top">
  <div style:--move={moveEyes / 100} class="eyes">
    <Home href="#settings" />
  </div>
  {#if $stepStore === 'initialize' || $stepStore === 'versions'}
    <Loading />
  {:else}
    <ul aria-hidden="true">
      {#each $progressStore as change, index (change.id)}
        <li style:width="{change.part}%">
          {#if change.id === 'loading'}
            <Loading />
          {:else}
            <!-- element is hidden for a11y tree, since we have another menu -->
            <!-- svelte-ignore a11y_consider_explicit_label -->
            <a
              class:is-before={finish || index < currentIndex}
              class:is-reviewed={change.status === 'reviewed'}
              href={getChangeUrl(change.id)}
              tabindex="-1"
              title={change.id}
            >
              <div class="line"></div>
            </a>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</Panel>

<style>
  :root {
    --eyes-width: 1.875rem;
  }

  .eyes {
    position: relative;
    left: calc(var(--move, 0) * (100% - var(--eyes-width)));
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--eyes-width);
    transition: left 300ms cubic-bezier(0.5, 0, 0.75, 0);
  }

  ul {
    position: relative;
    display: flex;
    flex-grow: 1;
    align-items: center;
    height: 100%;
  }

  li {
    display: flex;
    align-items: center;
    height: 100%;
    list-style: none;
  }

  a {
    position: relative;
    left: 0;
    display: block;
    width: 100%;
    height: var(--control-height);
    border-radius: var(--radius);
    transition: left 150ms cubic-bezier(0.5, 0, 0.75, 0);

    &:hover,
    &:active {
      background: var(--panel-hover-background);
    }

    &:active {
      box-shadow: var(--pressed-shadow);
    }

    &.is-before {
      left: calc(-1 * var(--eyes-width));
    }
  }

  .line {
    position: absolute;
    top: calc(50% - var(--progress-stroke) / 2);
    right: 0;
    left: 0;
    display: block;
    height: var(--progress-stroke);
    content: '';
    background: var(--text-color);
    transition: background 150ms;

    a:active & {
      box-shadow: var(--line-pressed-shadow);
      translate: 0 1px;
    }

    a.is-reviewed & {
      background: var(--approve-background);
    }
  }
</style>

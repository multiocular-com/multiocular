<script lang="ts">
  import {
    $progress as progressStore,
    $step as stepStore
  } from '../../common/stores.ts'
  import { getChangeUrl } from '../stores/router.ts'
  import Header from '../ui/header.svelte'
  import Home from '../ui/home.svelte'
  import Loading from '../ui/loading.svelte'
</script>

<Header>
  <Home href="#settings" />
  {#if $stepStore === 'initialize' || $stepStore === 'versions'}
    <Loading animated />
  {:else}
    <ul aria-hidden="true">
      {#each $progressStore as change (change.id)}
        <li style:width="{change.part}%">
          {#if change.id === 'loading'}
            <Loading />
          {:else}
            <!-- element is hidden for a11y tree, since we have another menu -->
            <!-- svelte-ignore a11y_consider_explicit_label -->
            <a href={getChangeUrl(change.id)} title={change.id}></a>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</Header>

<style>
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
    display: block;
    width: 100%;
    height: 100%;

    &:hover {
      background: var(--hover-color);
    }
  }

  a::before {
    position: absolute;
    top: calc(50% - var(--progress-stroke) / 2);
    right: 0;
    left: 0;
    display: block;
    height: var(--progress-stroke);
    content: '';
    background: var(--text-color);
  }
</style>

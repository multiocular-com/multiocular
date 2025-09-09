<script lang="ts">
  import { $sortedChanges as sortedChangesStore } from '../../../common/stores.ts'
  import type { ChangeId } from '../../../common/types.ts'
  import { getChangeUrl } from '../../stores/router.ts'
  import Sidebar from '../sidebar.svelte'

  let { current }: { current: ChangeId } = $props()
</script>

<Sidebar position="left">
  <nav>
    <ul>
      {#each $sortedChangesStore as change (change.id)}
        <li class:is-loading={change.status === 'loading'}>
          <a
            class:is-reviewed={change.status === 'reviewed'}
            aria-current={current === change.id ? 'true' : 'false'}
            aria-disabled={change.status === 'loading'}
            href={getChangeUrl(change.id)}
          >
            <div class="name">{change.name}</div>
            <div class="versions">
              {change.before || 'none'} → {change.after}
            </div>
          </a>
        </li>
      {/each}
    </ul>
  </nav>
</Sidebar>

<style>
  li {
    list-style: none;

    &.is-loading {
      cursor: wait;
    }
  }

  a {
    display: block;
    padding: var(--safe-padding);
    padding-left: calc(var(--safe-padding) + 0.25rem);
    font: var(--control-font);
    color: var(--text-color);
    overflow-wrap: break-word;
    text-decoration: none;

    &:hover,
    &:active {
      background: var(--main-hover-background);
    }

    &:active {
      box-shadow: var(--pressed-shadow);
    }

    &:focus-visible {
      outline-offset: -2px;
    }

    &.is-reviewed {
      padding-left: var(--safe-padding);
      border-left: 0.25rem solid var(--approve-background);
      opacity: 60%;
    }

    &[aria-disabled='true'] {
      pointer-events: none;
      opacity: 30%;
    }

    &[aria-current='true'] {
      padding-left: var(--safe-padding);
      border-left: 0.25rem solid var(--focus-color);
      opacity: 100%;
    }
  }

  .name {
    a:active & {
      translate: 0 1px;
    }
  }

  .versions {
    font: var(--secondary-font);
    color: var(--secondary-text-color);
    text-decoration: none;

    a:active & {
      translate: 0 1px;
    }
  }
</style>

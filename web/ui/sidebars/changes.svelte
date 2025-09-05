<script lang="ts">
  import { $sortedChanges as sortedChangesStore } from '../../../common/stores.ts'
  import type { ChangeId } from '../../../common/types.ts'
  import { getChangeUrl } from '../../stores/router.ts'

  let { current }: { current: ChangeId } = $props()
</script>

<nav>
  <ul>
    {#each $sortedChangesStore as change (change.id)}
      <li class:is-loading={change.status === 'loading'}>
        <a
          aria-current={current === change.id ? 'true' : 'false'}
          aria-disabled={change.status === 'loading'}
          href={getChangeUrl(change.id)}
        >
          <div class="name">{change.name}</div>
          <div class="versions">
            {change.before} → {change.after}
          </div>
        </a>
      </li>
    {/each}
  </ul>
</nav>

<style>
  nav {
    position: fixed;
    top: var(--panel-height);
    bottom: var(--panel-height);
    left: 0;
    z-index: 1;
    width: var(--sidebar-width);
    overflow: auto;
    box-shadow: var(--panel-shadow);
  }

  li {
    list-style: none;

    &.is-loading {
      cursor: wait;
    }
  }

  a {
    display: block;
    padding: 0.5rem;
    color: var(--text-color);
    overflow-wrap: break-word;
    text-decoration: none;

    &:hover,
    &:active {
      background: var(--main-hover-color);
    }

    &:active {
      box-shadow: var(--pressed-shadow);
    }

    &:focus-visible {
      outline-offset: -2px;
    }

    li.is-loading & {
      pointer-events: none;
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

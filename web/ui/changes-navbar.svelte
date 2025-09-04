<script lang="ts">
  import { $sortedChanges as sortedChangesStore } from '../../common/stores.ts'
  import type { ChangeId } from '../../common/types.ts'
  import { getChangeUrl } from '../stores/router.ts'

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
            {change.before} > {change.after}
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
    overflow: auto;
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
    text-decoration: none;
    border-radius: var(--radius);

    &:hover,
    &:active {
      background: var(--hover-color);
      box-shadow: var(--button-border);
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
    text-decoration: underline;

    a:active & {
      translate: 0 1px;
    }
  }

  .versions {
    margin-top: 0.4rem;
    font-size: 80%;
    color: var(--secondary-text-color);
    text-decoration: none;

    a:active & {
      translate: 0 1px;
    }
  }
</style>

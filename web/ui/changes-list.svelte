<script lang="ts">
  import type { Change } from '../../common/stores.ts'
  import type { ChangeId } from '../../common/types.ts'
  import { getChangeUrl } from '../stores/router.ts'

  let { changes, current }: { changes: readonly Change[]; current: ChangeId } =
    $props()
</script>

<nav>
  <ul>
    {#each changes as change (change.id)}
      <li>
        <a
          aria-current={current === change.id ? 'true' : 'false'}
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
  }

  a {
    display: block;
    padding: 0.5rem;
    color: var(--text-color);
    text-decoration: none;

    &:hover,
    &:active {
      background: var(--hover-color);
    }

    &:active {
      box-shadow: var(--pressed-shadow);
    }

    &:focus-visible {
      outline-offset: -2px;
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

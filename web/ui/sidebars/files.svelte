<script lang="ts">
  import { getHtmlId } from 'diff2html/lib-esm/render-utils.js'

  import type { FileDiffs } from '../../../common/stores.ts'
  import type { LoadingValue } from '../../stores/change.ts'
  import Sidebar from '../sidebar.svelte'

  let page = document.querySelector('.page')
  function scrollTo(id: string | undefined): void {
    if (!id) {
      page?.scrollTo(0, 0)
    } else {
      let file = document.getElementById(id)
      file?.scrollIntoView()
    }
  }

  let { content }: { content: LoadingValue<FileDiffs> } = $props()
</script>

<Sidebar maxWidth={1200} position="right">
  {#if !content.isLoading}
    <ul>
      <li>
        <button
          onclick={() => {
            scrollTo(undefined)
          }}
        >
          <span></span> Changelog
        </button>
      </li>
      {#each content.value as file (file.newName + file.oldName)}
        {#if !file.isDeleted}
          <li>
            <button
              onclick={() => {
                scrollTo(getHtmlId(file))
              }}
            >
              {#if file.isNew}
                <span class="is-add">+</span>
              {:else}
                <span class="is-edit">/</span>
              {/if}
              {file.newName}
            </button>
          </li>
        {/if}
      {/each}
    </ul>
  {/if}
</Sidebar>

<style>
  button {
    display: block;
    width: 100%;
    padding: 0.25rem var(--safe-padding);
    color: var(--text-color);
    text-align: left;
    overflow-wrap: break-word;
    text-decoration: none;
    background: transparent;
    border: none;

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
  }

  span {
    display: inline-block;
    width: 0.6rem;
    font-weight: bold;

    &.is-add {
      font-weight: bold;
      color: var(--approve-background);
    }

    &.is-edit {
      opacity: 50%;
    }
  }
</style>

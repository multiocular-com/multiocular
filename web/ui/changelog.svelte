<script lang="ts">
  import DOMPurify from 'dompurify'

  import type { ChangeLogHtml } from '../../common/stores.ts'

  let { content }: { content: ChangeLogHtml } = $props()
</script>

<section>
  {#each content as log (log[0])}
    <h2>{log[0]}</h2>
    <div class="changelog">
      {@html DOMPurify.sanitize(log[1])}
    </div>
  {/each}
</section>

<style>
  section {
    padding: 0 var(--safe-padding);
  }

  h2 {
    margin-bottom: var(--safe-padding);
    font: var(--title-font);

    &:not(:first-child) {
      margin-top: 1rem;
    }
  }

  .changelog {
    word-wrap: break-word;

    :global(p) {
      margin-bottom: var(--safe-padding);
    }

    :global(h1, h2, h3, h4, h5, h6) {
      margin-top: 1rem;
      margin-bottom: var(--safe-padding);
      font: var(--subtitle-font);
    }

    :global(strong, b) {
      font-weight: bold;
    }

    :global(ul, ol) {
      padding-left: 1rem;
      margin-bottom: var(--safe-padding);
    }

    :global(a) {
      color: var(--link-color);

      &:visited {
        color: var(--visited-color);
      }
    }

    :global(hr) {
      border: 1px solid var(--panel-border-color);
      border-bottom: none;
    }
  }
</style>

<script lang="ts">
  import type { ChangeLog } from '../../common/stores.ts'

  let { content }: { content: ChangeLog } = $props()
</script>

<section>
  {#each content as log (log[0])}
    <h2>{log[0]}</h2>
    <p>{log[1]}</p>
  {/each}
</section>

<style>
  section {
    padding: var(--safe-padding);
    border-bottom: 1px solid var(--panel-border-color);
  }

  h2 {
    margin-bottom: var(--safe-padding);
    font: var(--title-font);
  }

  p {
    font: var(--code-font);
    word-wrap: break-word;
    white-space: pre-wrap;
  }
</style>

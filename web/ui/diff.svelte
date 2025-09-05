<script lang="ts">
  import type { Diff } from '../../common/types.ts'

  const map: Record<string, string> = {
    "'": '&#039;',
    '"': '&quot;',
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
  }
  function escapeHTML(str: string): string {
    return str.replace(/[&<>"']/g, m => map[m]!)
  }

  let { content }: { content: Diff } = $props()
  let html = $derived.by(() => {
    return content
      .split('\n')
      .map(i => {
        let safe = escapeHTML(i)
        if (safe.startsWith('+') || safe.startsWith('*')) {
          return `<div class="diff-line is-add">${safe}</div>`
        } else if (safe.startsWith('-')) {
          return `<div class="diff-line is-remove">${safe}</div>`
        } else if (safe.startsWith(' ')) {
          return safe
        } else {
          return `<div class="diff-line is-note">${safe}</div>`
        }
      })
      .join('\n')
  })
</script>

<pre class="diff">{@html html}</pre>

<style>
  .diff {
    padding: var(--safe-padding) 1rem;
  }

  :global(.diff-line) {
    display: inline-block;
    width: 100%;
    padding: 0 1rem;
    margin: 0 -1rem;

    &.is-note {
      color: var(--secondary-text-color);
    }

    &.is-add {
      background: var(--add-text-background);
    }

    &.is-remove {
      background: var(--remove-text-background);
    }
  }
</style>

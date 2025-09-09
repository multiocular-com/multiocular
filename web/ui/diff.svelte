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

<pre>{@html html}</pre>

<style>
  :global(.diff-line) {
    display: inline-block;
    width: 100%;
    padding: 0 var(--safe-padding);

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

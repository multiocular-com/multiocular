<script lang="ts">
  import 'diff2html/bundles/js/diff2html-ui-slim.min.js'

  import 'diff2html/bundles/css/diff2html.min.css'

  import type { ColorSchemeType } from 'diff2html/lib-esm/types.ts'
  import { Diff2HtmlUI } from 'diff2html/lib/ui/js/diff2html-ui-slim.js'

  import type { FileDiffs } from '../../common/stores.ts'
  import { $dark as darkStore } from '../stores/dark.ts'

  let { content }: { content: FileDiffs } = $props()

  let root: HTMLDivElement

  $effect(() => {
    let diff = new Diff2HtmlUI(root, content, {
      colorScheme: ($darkStore ? 'dark' : 'light') as ColorSchemeType,
      drawFileList: false,
      highlight: true,
      maxLineLengthHighlight: 5000,
      renderNothingWhenEmpty: true
    })
    diff.draw()
  })
</script>

<div bind:this={root} class="diff"></div>

<style>
  .diff {
    :global(.d2h-file-header) {
      position: sticky;
      top: var(--panel-height);
      font: var(--title-font);
    }

    :global(.d2h-file-wrapper) {
      border-inline: none;
      border-radius: 0;
    }

    :global(.d2h-diff-table) {
      font: var(--code-font);
    }

    :global(.d2h-code-line) {
      padding-inline: var(--safe-padding);
    }

    :global(.d2h-tag, .d2h-code-linenumber, .d2h-icon, .d2h-file-collapse) {
      display: none !important;
    }

    :global(.hljs) {
      background: transparent;
    }

    :global(
      .hljs-doctag,
      .hljs-keyword,
      .hljs-meta .hljs-keyword,
      .hljs-template-tag,
      .hljs-template-variable,
      .hljs-type,
      .hljs-variable.language_
    ) {
      color: var(--keyword-color);
    }

    :global(
      .hljs-title,
      .hljs-title.class_,
      .hljs-title.class_.inherited__,
      .hljs-title.function_
    ) {
      color: var(--entity-color);
    }

    :global(
      .hljs-attr,
      .hljs-attribute,
      .hljs-literal,
      .hljs-meta,
      .hljs-number,
      .hljs-operator,
      .hljs-variable,
      .hljs-selector-attr,
      .hljs-selector-class,
      .hljs-selector-id
    ) {
      color: var(--constant-color);
    }

    :global(.hljs-regexp, .hljs-string, .hljs-meta .hljs-string) {
      color: var(--string-color);
    }

    :global(.hljs-built_in, .hljs-symbol) {
      color: var(--variable-color);
    }

    :global(.hljs-comment, .hljs-code, .hljs-formula) {
      color: var(--comment-color);
    }

    :global(
      .hljs-name,
      .hljs-quote,
      .hljs-selector-tag,
      .hljs-selector-pseudo
    ) {
      color: var(--tag-color);
    }
  }
</style>

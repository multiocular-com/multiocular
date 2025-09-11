import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'

import type { Markdown, SafeHTML } from '../../common/types.ts'

export async function markdownToSafeHtml(
  markdown: Markdown
): Promise<SafeHTML> {
  return sanitizeHtml(await marked(markdown)) as SafeHTML
}

import { marked } from 'marked'

import type { DangerousHTML, Markdown } from '../../common/types.ts'

export async function markdownToDangerousHtml(
  markdown: Markdown
): Promise<DangerousHTML> {
  return (await marked(markdown)) as DangerousHTML
}

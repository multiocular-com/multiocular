import { diff } from '../../../common/types.ts'
import { type DiffLoader, getDiffPrefixes } from './common.ts'

interface GitHubContent {
  download_url: string
  name: string
  type: string
}

async function load(url: string): Promise<Response> {
  let response = await fetch(url)
  if (!response.ok) {
    throw new Error(
      `Failed to fetch diff: ${response.status}\n` + (await response.text())
    )
  }
  return response
}
export const githubActions = (async change => {
  let { diffDstPrefix, diffSrcPrefix } = getDiffPrefixes(change)

  if (change.before === false) {
    // For new actions, show all files by getting initial commit diff
    let response = await load(
      `https://api.github.com/repos/${change.name}/contents`
    )
    let contents = (await response.json()) as GitHubContent[]
    let fileDiffs = []
    for (let item of contents) {
      if (item.type === 'file') {
        let fileResponse = await fetch(item.download_url)
        if (fileResponse.ok) {
          let content = await fileResponse.text()
          let lines = content.split('\n')
          fileDiffs.push(
            `diff --git /dev/null ${diffDstPrefix}${item.name}\n` +
              `new file mode 100644\n` +
              `index 0000000..${change.after.substring(0, 7)}\n` +
              `--- /dev/null\n` +
              `+++ ${diffDstPrefix}${item.name}\n` +
              `@@ -0,0 +1,${lines.length} @@\n` +
              lines.map(line => `+${line}`).join('\n')
          )
        }
      }
    }
    return diff(fileDiffs.join('\n'))
  } else {
    let response = await load(
      `https://github.com/${change.name}/compare/` +
        `${change.before}...${change.after}.diff`
    )
    return diff(
      (await response.text())
        .replace(
          /^diff --git a\/(.+) b\/(.+)$/gm,
          `diff --git ${diffSrcPrefix}$1 ${diffDstPrefix}$2`
        )
        .replace(/^\+\+\+ b\//gm, `+++ ${diffDstPrefix}`)
        .replace(/^--- a\//gm, `--- ${diffSrcPrefix}`)
    )
  }
}) satisfies DiffLoader

import {
  diffType,
  type GitHubRepository,
  type GitHubRepositoryURL
} from '../../../common/types.ts'
import { githubApi } from '../github.ts'
import type { DiffLoader } from './common.ts'

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

export const githubActions = {
  findRepository(root, change) {
    return `https://github.com/${change.name}` as GitHubRepositoryURL
  },

  async loadDiff(root, change) {
    if (change.before === false) {
      // For new actions, show all files by getting initial commit diff
      let contents = await githubApi<GitHubContent[]>(
        change.name as GitHubRepository,
        '/contents'
      )
      if (!contents) return diffType('')

      let fileDiffs: string[] = []
      for (let item of contents) {
        if (item.type === 'file') {
          let fileResponse = await fetch(item.download_url)
          if (fileResponse.ok) {
            let content = await fileResponse.text()
            let lines = content.split('\n')
            fileDiffs.push(
              `diff --git /dev/null ${item.name}\n` +
                `new file mode 100644\n` +
                `index 0000000..${change.after.substring(0, 7)}\n` +
                `--- /dev/null\n` +
                `+++ /b/${item.name}\n` +
                `@@ -0,0 +1,${lines.length} @@\n` +
                lines.map(line => `+${line}`).join('\n')
            )
          }
        }
      }
      return diffType(fileDiffs.join('\n'))
    } else {
      let beforeRef = change.realBefore || change.before
      let afterRef = change.realAfter || change.after
      let response = await load(
        `https://github.com/${change.name}/compare/` +
          `${beforeRef}...${afterRef}.diff`
      )
      return diffType(await response.text())
    }
  }
} satisfies DiffLoader

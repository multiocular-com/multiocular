<script context="module" lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'

  import type { Change } from '../../common/stores.ts'
  import type { Debrand } from '../../common/types.ts'
  import Main from '../main/main.svelte'
  import Scene from './scene.svelte'

  let { Story } = defineMeta({
    component: Main,
    title: 'States'
  })

  const CHANGES = [
    { after: '5.1.5', before: '5.1.4', name: 'nanoid' },
    {
      after: '9.0.0',
      before: '8.0.0',
      direct: true,
      name: 'nanoevents',
      size: 10,
      status: 'reviewed'
    },
    {
      after: '8.41.0',
      before: '8.40.0',
      name: '@typescript-eslint/project-service',
      size: 100
    },
    {
      after: '8.41.0',
      before: '8.40.0',
      name: 'typescript-eslint',
      size: 10
    },
    {
      after: '8.0.1',
      before: '8.0.0',
      name: 'postcss',
      size: 50
    }
  ] satisfies Partial<Debrand<Change>>[]

  const DIFFS = {
    'npm:typescript-eslint@8.40.0>8.41.0': `diff --git package.json package.json
index v8.40.0..v8.41.0 100644
--- package.json
+++ package.json
@@ -1,6 +1,6 @@
{
  "name": "typescript-eslint",
-  "version": "8.40.0",
+  "version": "8.41.0",
  "description": "Tooling which enables you to use TypeScript with ESLint",
  "files": [
    "dist",`
  }

  const CHANGELOGS = {
    'npm:typescript-eslint@8.40.0>8.41.0': [
      [
        '8.41.0',
        '<h3>🚀 Features</h3>\n\n' +
          '<ul><li>tighten <code>tsconfigRootDir</code> validation (<a href="#">#11463</a>) and <a href="#">releases</a> on our website.</li></ol>'
      ]
    ]
  }
</script>

<Story name="Initialize" asChild parameters={{ layout: 'fullscreen' }}>
  <Scene step="initialize">
    <Main />
  </Scene>
</Story>

<Story
  name="Initialize Dark"
  asChild
  parameters={{ layout: 'fullscreen', themes: { themeOverride: 'dark' } }}
>
  <Scene step="initialize">
    <Main />
  </Scene>
</Story>

<Story name="Diff Loading" asChild parameters={{ layout: 'fullscreen' }}>
  <Scene
    changes={CHANGES.map(i => {
      if (i.status === 'reviewed') {
        return {
          ...i,
          status: 'loading'
        }
      } else {
        return i
      }
    })}
    hash="change/npm:nanoevents@8.0.0%3E9.0.0"
    step="diffs"
  >
    <Main />
  </Scene>
</Story>

<Story name="ChangeLog Loading" asChild parameters={{ layout: 'fullscreen' }}>
  <Scene
    changes={CHANGES.map(i => ({ ...i, status: 'loaded' }))}
    diffs={DIFFS}
    hash="#change/npm:typescript-eslint@8.40.0%3E8.41.0"
    step="diffs"
  >
    <Main />
  </Scene>
</Story>

<Story name="Change" asChild parameters={{ layout: 'fullscreen' }}>
  <Scene
    changelogs={CHANGELOGS}
    changes={CHANGES}
    diffs={DIFFS}
    hash="#change/npm:typescript-eslint@8.40.0%3E8.41.0"
    step="diffs"
  >
    <Main />
  </Scene>
</Story>

<Story name="New Dependency" asChild parameters={{ layout: 'fullscreen' }}>
  <Scene
    changelogs={{}}
    changes={CHANGES.map(i => ({ ...i, before: false }))}
    diffs={{
      'npm:typescript-eslint@8.41.0':
        DIFFS['npm:typescript-eslint@8.40.0>8.41.0']
    }}
    hash="#change/npm:typescript-eslint@8.41.0"
    step="diffs"
  >
    <Main />
  </Scene>
</Story>

<Story
  name="Change Dark"
  asChild
  parameters={{ layout: 'fullscreen', themes: { themeOverride: 'dark' } }}
>
  <Scene
    changelogs={CHANGELOGS}
    changes={CHANGES.map(i => ({ ...i, direct: false }))}
    diffs={DIFFS}
    hash="change/npm:typescript-eslint@8.40.0%3E8.41.0"
    step="diffs"
  >
    <Main />
  </Scene>
</Story>

<Story name="Finish" asChild parameters={{ layout: 'fullscreen' }}>
  <Scene
    changes={CHANGES.map(i => ({ ...i, status: 'reviewed' }))}
    hash="finish"
  >
    <Main />
  </Scene>
</Story>

<Story
  name="Finish Dark"
  asChild
  parameters={{ layout: 'fullscreen', themes: { themeOverride: 'dark' } }}
>
  <Scene
    changes={CHANGES.map(i => ({ ...i, status: 'reviewed' }))}
    hash="finish"
  >
    <Main />
  </Scene>
</Story>

<Story name="No Changes" asChild parameters={{ layout: 'fullscreen' }}>
  <Scene changes={[]} step="done">
    <Main />
  </Scene>
</Story>

<Story name="Not Found" asChild parameters={{ layout: 'fullscreen' }}>
  <Scene hash="404">
    <Main />
  </Scene>
</Story>

<Story name="Unloaded Change" asChild parameters={{ layout: 'fullscreen' }}>
  <Scene
    changes={[]}
    hash="change/npm:@typescript-eslint/project-service@8.40.0%3E8.41.0"
    step="versions"
  >
    <Main />
  </Scene>
</Story>

<script context="module" lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'

  import Main from '../main/main.svelte'
  import Scene from './scene.svelte'

  let { Story } = defineMeta({
    component: Main,
    title: 'States'
  })
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
    changes={[
      { after: '5.1.5', before: '5.1.4', name: 'nanoid', status: 'loading' },
      {
        after: '8.0.0',
        before: '9.0.0',
        name: 'nanoevents',
        status: 'loading'
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
      { after: '8.0.1', before: '8.0.0', name: 'postcss', size: 50 }
    ]}
    hash="change/npm:@typescript-eslint/project-service@8.40.0%3E8.41.0"
    step="diffs"
  >
    <Main />
  </Scene>
</Story>

<Story name="Diff" asChild parameters={{ layout: 'fullscreen' }}>
  <Scene
    changes={[
      { after: '5.1.5', before: '5.1.4', name: 'nanoid', status: 'reviewed' },
      {
        after: '8.0.0',
        before: '9.0.0',
        name: 'nanoevents',
        size: 10
      },
      {
        after: '8.41.0',
        before: '8.40.0',
        name: '@typescript-eslint/project-service',
        size: 100,
        status: 'reviewed'
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
        size: 50,
        status: 'reviewed'
      }
    ]}
    diffs={{
      'npm:typescript-eslint@8.40.0>8.41.0': `diff --git npm:typescript-eslint@8.40.0/package.json npm:typescript-eslint@8.41.0/package.json
index v8.40.0..v8.41.0 100644
--- npm:typescript-eslint@8.40.0/package.json
+++ npm:typescript-eslint@8.41.0/package.json
@@ -1,6 +1,6 @@
  {
    "name": "typescript-eslint",
-  "version": "8.40.0",
+  "version": "8.41.0",
    "description": "Tooling which enables you to use TypeScript with ESLint",
    "files": [
      "dist",`
    }}
    hash="#change/npm:typescript-eslint@8.40.0%3E8.41.0"
    step="diffs"
  >
    <Main />
  </Scene>
</Story>

<Story
  name="Diff Dark"
  asChild
  parameters={{ layout: 'fullscreen', themes: { themeOverride: 'dark' } }}
>
  <Scene
    changes={[
      { after: '5.1.5', before: '5.1.4', name: 'nanoid', status: 'reviewed' },
      {
        after: '8.0.0',
        before: '9.0.0',
        name: 'nanoevents',
        size: 10,
        status: 'reviewed'
      },
      {
        after: '8.41.0',
        before: '8.40.0',
        name: '@typescript-eslint/project-service',
        size: 100,
        status: 'reviewed'
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
        size: 50,
        status: 'reviewed'
      }
    ]}
    diffs={{
      'npm:typescript-eslint@8.40.0>8.41.0': `diff --git npm:typescript-eslint@8.40.0/package.json npm:typescript-eslint@8.41.0/package.json
index v8.40.0..v8.41.0 100644
--- npm:typescript-eslint@8.40.0/package.json
+++ npm:typescript-eslint@8.41.0/package.json
@@ -1,6 +1,6 @@
  {
    "name": "typescript-eslint",
-  "version": "8.40.0",
+  "version": "8.41.0",
    "description": "Tooling which enables you to use TypeScript with ESLint",
    "files": [
      "dist",`
    }}
    hash="change/npm:typescript-eslint@8.40.0%3E8.41.0"
    step="diffs"
  >
    <Main />
  </Scene>
</Story>

<Story name="Finish" asChild parameters={{ layout: 'fullscreen' }}>
  <Scene hash="finish">
    <Main />
  </Scene>
</Story>

<Story
  name="Finish Dark"
  asChild
  parameters={{ layout: 'fullscreen', themes: { themeOverride: 'dark' } }}
>
  <Scene hash="finish">
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

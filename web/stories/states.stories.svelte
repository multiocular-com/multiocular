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
        size: 10
      },
      {
        after: '7.1.2',
        before: '7.1.1',
        name: 'npm-install-checks',
        size: 100
      },
      { after: '8.0.1', before: '8.0.0', name: 'postcss', size: 50 }
    ]}
    hash="#change/npm:@typescript-eslint/project-service@8.40.0%3E8.41.0"
    step="diffs"
  >
    <Main />
  </Scene>
</Story>

<Story name="Eyes Moving" asChild parameters={{ layout: 'fullscreen' }}>
  <Scene
    changes={[
      {
        after: '5.1.5',
        before: '5.1.4',
        name: 'nanoid',
        size: 10,
        status: 'loaded'
      },
      {
        after: '8.0.0',
        before: '9.0.0',
        name: 'nanoevents',
        size: 10,
        status: 'loaded'
      },
      {
        after: '8.41.0',
        before: '8.40.0',
        name: '@typescript-eslint/project-service',
        size: 10
      },
      {
        after: '7.1.2',
        before: '7.1.1',
        name: 'npm-install-checks',
        size: 100
      },
      { after: '8.0.1', before: '8.0.0', name: 'postcss', size: 50 }
    ]}
    hash="#change/npm:postcss@8.0.0%3E8.0.1"
    step="diffs"
  >
    <Main />
  </Scene>
</Story>

<Story name="Not Found" asChild parameters={{ layout: 'fullscreen' }}>
  <Scene hash="404">
    <Main />
  </Scene>
</Story>

<Story name="No Changes" asChild parameters={{ layout: 'fullscreen' }}>
  <Scene changes={[]} step="done">
    <Main />
  </Scene>
</Story>

<Story
  name="No Changes Dark"
  asChild
  parameters={{ layout: 'fullscreen', themes: { themeOverride: 'dark' } }}
>
  <Scene changes={[]} step="done">
    <Main />
  </Scene>
</Story>

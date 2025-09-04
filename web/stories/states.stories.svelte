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

<Story name="Not Found" asChild parameters={{ layout: 'fullscreen' }}>
  <Scene hash="404">
    <Main />
  </Scene>
</Story>

<Story name="Empty" asChild parameters={{ layout: 'fullscreen' }}>
  <Scene changes={[]} step="done">
    <Main />
  </Scene>
</Story>

<Story
  name="Empty Dark"
  asChild
  parameters={{ layout: 'fullscreen', themes: { themeOverride: 'dark' } }}
>
  <Scene changes={[]} step="done">
    <Main />
  </Scene>
</Story>

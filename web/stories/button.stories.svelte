<script context="module" lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'

  import Button from '../ui/button.svelte'

  let { Story } = defineMeta({
    component: Button,
    title: 'UI / Button'
  })
</script>

<Story name="Initialize" asChild>
  <section>
    <Button variant="simple">Simple</Button>
    <Button state="hover" variant="simple">Hover</Button>
    <Button state="pressed" variant="simple">Pressed</Button>
  </section>
  <section>
    <Button variant="ghost">Ghost</Button>
    <Button state="hover" variant="ghost">Hover</Button>
    <Button state="pressed" variant="ghost">Pressed</Button>
  </section>
  <section>
    <Button href="#">Link</Button>
  </section>
</Story>

<Story name="Dark" asChild parameters={{ themes: { themeOverride: 'dark' } }}>
  <section>
    <Button variant="simple">Simple</Button>
    <Button state="hover" variant="simple">Hover</Button>
    <Button state="pressed" variant="simple">Pressed</Button>
  </section>
  <section>
    <Button variant="ghost">Ghost</Button>
    <Button state="hover" variant="ghost">Hover</Button>
    <Button state="pressed" variant="ghost">Pressed</Button>
  </section>
</Story>

<style>
  section + section {
    margin-top: 1rem;
  }
</style>

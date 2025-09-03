<script context="module" lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'

  import Button from '../ui/button.svelte'

  let { Story } = defineMeta({
    component: Button,
    title: 'UI / Button'
  })
</script>

<Story name="Initialize" asChild>
  <Button variant="ghost">Ghost</Button>
  <Button state="hover" variant="ghost">Ghost</Button>
  <Button state="pressed" variant="ghost">Ghost</Button>
</Story>

<Story name="Dark" asChild parameters={{ themes: { themeOverride: 'dark' } }}>
  <Button variant="ghost">Ghost</Button>
  <Button state="hover" variant="ghost">Ghost</Button>
  <Button state="pressed" variant="ghost">Ghost</Button>
</Story>

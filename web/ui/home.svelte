<script lang="ts">
  import Button from './button.svelte'
  import Logo from './logo.svelte'

  let { href = '#', name = false }: { href?: string; name?: boolean } = $props()
</script>

<Button aria-label="Home" {href} padding={name ? 'm' : 's'} variant="ghost">
  <Logo />
  {#if name}
    <div class="name">Multiocular</div>
  {/if}
</Button>

<style>
  .name {
    font-family: var(--decorative-font);
    font-size: 200%;
  }
</style>

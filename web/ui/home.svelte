<script lang="ts">
  import Button from './button.svelte'
  import Logo from './logo.svelte'

  let { href = '#', name = false }: { href?: string; name?: boolean } = $props()
</script>

<Button
  aria-label="Home"
  {href}
  padding={name ? 'm' : 's'}
  tabindex={name ? 0 : -1}
  variant="ghost"
>
  <div class="logo">
    <Logo />
  </div>
  {#if name}
    <div class="name">Multiocular</div>
  {/if}
</Button>

<style>
  .logo {
    background: var(--panel-background);

    :global(a:hover) & {
      background: var(--panel-hover-background);
    }
  }

  .name {
    font: var(--cool-font);
  }
</style>

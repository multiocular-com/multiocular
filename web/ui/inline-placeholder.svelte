<script lang="ts">
  let { text }: { text: string } = $props()
</script>

<div class="center">
  {text}
</div>

<style>
  .center {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem var(--safe-padding);
    font: var(--cool-secondary-font);
    color: var(--secondary-text-color);
  }
</style>

<script lang="ts">
  let { text }: { text: string } = $props()
</script>

<main class="center">
  <h1>{text}</h1>
</main>

<style>
  .center {
    display: flex;
    flex-grow: 1;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  h1 {
    font-family: var(--decorative-font);
    font-size: 2rem;
    font-weight: 400;
    color: var(--secondary-text-color);
  }
</style>

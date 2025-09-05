<script lang="ts">
  let { loading, text }: { loading?: boolean; text: string } = $props()
</script>

<main class="center" class:is-loading={loading}>
  <h1>{text}</h1>
</main>

<style>
  .center {
    box-sizing: border-box;
    display: flex;
    flex-grow: 1;
    align-items: center;
    justify-content: center;
    min-height: 100%;
    padding: var(--safe-padding);

    &.is-loading {
      color: var(--secondary-text-color);
      background: var(--panel-color);
    }
  }

  h1 {
    font: var(--cool-font);
  }
</style>

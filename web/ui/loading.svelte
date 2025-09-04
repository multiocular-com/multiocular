<script lang="ts">
  let { animated }: { animated?: boolean } = $props()
</script>

<div class="loading" class:is-animated={animated}></div>

<style>
  /* From https://css-tricks.com/how-to-create-wavy-shapes-patterns-in-css/ */
  .loading {
    --loading-size: 0.375rem;
    --loading-stroke: 0.1875rem;

    display: grid;
    flex-grow: 1;
    height: calc(2 * var(--loading-size));

    &::before {
      --g:
        calc(-0.6 * var(--loading-size)),
        oklch(0 0 0 / 0%) calc(99% - var(--loading-stroke)),
        currentcolor calc(101% - var(--loading-stroke)) 99%,
        oklch(0 0 0 / 0%) 101%;
      --r: calc(1.166 * var(--loading-size) + var(--loading-stroke) / 2) at left
        50%;

      content: '';
      background:
        radial-gradient(var(--r) bottom var(--g))
          calc(50% - var(--loading-size)) calc(50% - var(--loading-size)) /
          calc(4 * var(--loading-size)) calc(2 * var(--loading-size)),
        radial-gradient(var(--r) top var(--g)) calc(50% + var(--loading-size))
          calc(50% + var(--loading-size)) / calc(4 * var(--loading-size))
          calc(2 * var(--loading-size));
    }

    &.is-animated::before {
      animation: --loading 0.75s infinite linear;
    }
  }

  @keyframes --loading {
    to {
      background-position:
        calc(50% - 5 * var(--loading-size)) calc(50% - var(--loading-size)),
        calc(50% - 3 * var(--loading-size)) calc(50% + var(--loading-size));
    }
  }
</style>

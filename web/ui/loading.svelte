<div class="loading"></div>

<style>
  /* From https://css-tricks.com/how-to-create-wavy-shapes-patterns-in-css/ */
  .loading {
    --loading-size: 0.375rem;

    display: grid;
    flex-grow: 1;
    height: calc(2 * var(--loading-size));
    animation: --loading 0.5s infinite linear;

    &::before {
      --g:
        calc(-0.6 * var(--loading-size)),
        oklch(0 0 0 / 0%) calc(99% - var(--progress-stroke)),
        currentcolor calc(101% - var(--progress-stroke)) 99%,
        oklch(0 0 0 / 0%) 101%;
      --r: calc(1.166 * var(--loading-size) + var(--progress-stroke) / 2) at
        left 50%;

      content: '';
      background:
        radial-gradient(var(--r) bottom var(--g))
          calc(50% - var(--loading-size)) calc(50% - var(--loading-size)) /
          calc(4 * var(--loading-size)) calc(2 * var(--loading-size)),
        radial-gradient(var(--r) top var(--g)) calc(50% + var(--loading-size))
          calc(50% + var(--loading-size)) / calc(4 * var(--loading-size))
          calc(2 * var(--loading-size));
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

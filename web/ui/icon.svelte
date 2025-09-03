<script lang="ts">
  // Use CSS `color` of the icon’s parent to change icon’s color
  // To change icon’s size, use --icon-size custom property.
  let {
    path,
    size = 1,
    viewbox = 24
  }: { path: string; size?: number; viewbox?: number } = $props()
</script>

<svg
  style:--icon-size="{size}rem"
  aria-hidden="true"
  viewBox="0 0 {viewbox} {viewbox}"
>
  <path d={path} />
</svg>

<style>
  svg {
    display: block;
    width: var(--icon-size);
    height: var(--icon-size);
  }

  path {
    fill: currentcolor;
  }
</style>

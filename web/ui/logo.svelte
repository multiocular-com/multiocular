<script lang="ts">
  import iconSvg from '../public/icon.svg?raw'
  import Icon from './icon.svelte'

  let pathMatch = iconSvg.match(/<path d="([^"]+)"/)
  let iconPath = pathMatch?.[1] ?? ''
</script>

<Icon path={iconPath} size={1.5} viewbox={100} />

<script lang="ts">
  import Icon from '../icon.svelte'
  import iconSvg from './icon.svg?raw'

  let pathMatch = iconSvg.match(/ d="([^"]+)"/)
  let iconPath = pathMatch?.[1] ?? ''
</script>

<Icon path={iconPath} size={1.5} viewbox={100} />

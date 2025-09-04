<script lang="ts">
  import Header from '../ui/header.svelte'
  import Home from '../ui/home.svelte'
  import Loading from '../ui/loading.svelte'
</script>

<Header>
  <Home href="#settings" />
  <Loading animated />
</Header>

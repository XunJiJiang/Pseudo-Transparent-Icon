<script lang="ts">
  import Home from '$pages/home.svelte'
  import List from '$pages/list/index.svelte'
</script>

<main class="m-auto w-screen max-w-4xl p-4 wrap-break-word">
  <Home onstart={() => console.log('Home started')} />
  <List />
</main>

<script lang="ts">
  import { m } from '$lib/paraglide/messages'
  import DetermineConfig from './modules/determine-config.svelte'
</script>

<div class="m-auto mt-4 max-w-2xl wrap-break-word">
  <DetermineConfig />
  <DetermineConfig disabled open />
</div>

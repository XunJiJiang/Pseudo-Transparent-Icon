<script lang="ts">
  import Button from '$lib/button.svelte'
  import Link from '$lib/link.svelte'
  import { m } from '$lib/paraglide/messages'

  const {
    onstart
  }: {
    onstart: () => void
  } = $props()
</script>

<div class="m-auto max-w-4xl wrap-break-word">
  <h2 class="mb-4 text-2xl font-bold">{m['home.title']()}</h2>
  <p class="mb-2 text-lg font-semibold">{m['home.title_description']()}</p>
  <p class="mb-4 text-lg leading-relaxed">{m['home.description']()}</p>
  <Button
    style="primary"
    class="mr-2.5 p-1 pr-3 pl-3 text-[1em] font-medium"
    ariaLabel={m['home.get_started']()}
    onclick={onstart}
  >
    {m['home.get_started']()}
  </Button>
  <Link
    href="https://github.com/XunJiJiang/Pseudo-Transparent-Icon"
    target="_blank"
    style="text"
    class="p-1 pr-3 pl-3 text-[1em]"
    ariaLabel={m['home.github']()}
  >
    {m['home.github']()}
  </Link>
</div>

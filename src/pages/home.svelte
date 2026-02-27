<script lang="ts">
  import Button from '$lib/button.svelte'
  import Link from '$lib/link.svelte'
  import { m } from '$lib/paraglide/messages'

  const {
    onstart
  }: {
    onstart: () => void
  } = $props()

  let hasStarted = $state(false)
  let containerClass = $state('')
</script>

<div
  class={['m-auto max-w-4xl wrap-break-word transition-opacity duration-200', containerClass]}
  class:opacity-0={hasStarted}
>
  <h2 class="mb-4 text-2xl font-bold">{m['home.title']()}</h2>
  <p class="mb-2 text-lg font-semibold">{m['home.title_description']()}</p>
  <p class="mb-4 text-lg leading-relaxed">{m['home.description']()}</p>
  <Button
    style="primary"
    class="mr-2.5 p-1 pr-3 pl-3 text-[1em] font-medium"
    ariaLabel={m['home.get_started']()}
    onclick={() => {
      // if (hasStarted) {
      //   return
      // }
      // hasStarted = true
      // containerClass = 'pointer-events-none'
      // setTimeout(() => {
      // containerClass = 'pointer-events-none hidden'
      // onstart()
      // }, 200)
      onstart()
    }}
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

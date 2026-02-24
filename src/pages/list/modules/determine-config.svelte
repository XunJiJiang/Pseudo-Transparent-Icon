<script lang="ts">
  import { m } from '$lib/paraglide/messages'
  import Collapse from '$/lib/collapse.svelte'

  let {
    disabled = false,
    open = $bindable(false)
  }: {
    disabled?: boolean
    open?: boolean
  } = $props()
</script>

<Collapse
  bind:open
  {disabled}
  headerAriaLabel={m['list.decision_config.header.aria_label']()}
  contentAriaLabel={m['list.decision_config.content.description']()}
  onopen={() => console.log('Collapse opened')}
  onclose={() => console.log('Collapse closed')}
>
  {#snippet header()}
    <h3 class="text-lg font-semibold">{m['list.decision_config.header.title']()}</h3>
    <p class="text-sm text-gray-500 dark:text-gray-400">
      {m['list.decision_config.content.description']()}
    </p>
  {/snippet}
  {#snippet content()}
    {m['list.decision_config.content.description']()}
  {/snippet}
</Collapse>

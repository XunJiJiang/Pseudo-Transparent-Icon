<script lang="ts">
  import { m } from '$lib/paraglide/messages'
  import Collapse from '$/lib/collapse.svelte'
  import type { ClassValue } from 'svelte/elements'

  let {
    visible,
    isLast,
    disabled = false,
    open = $bindable(false),
    class: ClassName
  }: {
    /** 是否可见，控制整个组件的显示与隐藏 */
    visible: boolean
    /** 是否为列表中的最后一个配置项，影响组件的显示动画 */
    isLast: boolean
    disabled?: boolean
    open?: boolean
    class?: ClassValue
  } = $props()

  /**
   * 重置配置项到初始状态
   */
  export function reset() {}

  /**
   * 获取当前配置项的值
   */
  export function getConfig() {
    return {}
  }
</script>

<Collapse
  class={ClassName}
  bind:open
  {disabled}
  headerAriaLabel={m['list.determine_config.header.aria_label']()}
  contentAriaLabel={m['list.determine_config.content.description']()}
  onopen={() => console.log('Collapse opened')}
  onclose={() => console.log('Collapse closed')}
  ontoggle={(isOpen) => console.log('Collapse toggled, isOpen:', isOpen)}
>
  {#snippet header()}
    <h3 class="text-lg font-semibold">{m['list.determine_config.header.title']()}</h3>
    <p class="text-sm text-gray-500 dark:text-gray-400">
      {m['list.determine_config.content.description']()}
    </p>
  {/snippet}
  {#snippet content(change)}
    {m['list.determine_config.content.description']()}
    <Collapse open headerAriaLabel={'test'} contentAriaLabel={'test'}>
      {#snippet header()}
        <h4 class="text-md font-medium">test</h4>
      {/snippet}
      {#snippet content(change)}
        <Collapse open headerAriaLabel={'test'} contentAriaLabel={'test'}>
          {#snippet header()}
            <h4 class="text-md font-medium">test</h4>
          {/snippet}
          {#snippet content()}
            test
          {/snippet}
        </Collapse>
      {/snippet}
    </Collapse>
  {/snippet}
</Collapse>

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
    <Collapse
      class="mt-1! mb-1 rounded-lg"
      headerAriaLabel={'test'}
      contentAriaLabel={'test'}
      ontoggle={() => {
        const interval = setInterval(() => {
          change()
        }, 151 /* 值越小, 响应越快, 但是太小会卡顿 */)
        setTimeout(() => {
          clearInterval(interval)
          change()
        }, 300 /* 开始尺寸变化到结束的持续时常 */)
      }}
      onHeightChange={(h, o) => {
        console.log('new:', h, 'old:', o)
        const interval = setInterval(() => {
          change()
        }, 151 /* 值越小, 响应越快, 但是太小会卡顿 */)
        setTimeout(() => {
          clearInterval(interval)
          change()
        }, 300 /* 开始尺寸变化到结束的持续时常 */)
      }}
    >
      {#snippet header()}
        <h4 class="text-md font-medium">test</h4>
      {/snippet}
      {#snippet content(change)}
        <Collapse
          open
          class="mt-1! mb-1 rounded-lg"
          headerAriaLabel={'test'}
          contentAriaLabel={'test'}
          ontoggle={() => {
            const interval = setInterval(() => {
              change()
            }, 151 /* 值越小, 响应越快, 但是太小会卡顿 */)
            setTimeout(() => {
              clearInterval(interval)
              change()
            }, 300 /* 开始尺寸变化到结束的持续时常 */)
          }}
        >
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

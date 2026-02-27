<script lang="ts">
  import { m } from '$lib/paraglide/messages'
  import Collapse from '$/lib/collapse.svelte'
  import type { ClassValue } from 'svelte/elements'
  import { useTransition } from './utils/transition.svelte'
  import Button from '$/lib/button.svelte'

  let {
    visible,
    isLast,
    disabled = false,
    open = $bindable(false),
    class: ClassName,
    onchange = () => {}
  }: {
    /** 是否可见，控制整个组件的显示与隐藏 */
    visible: boolean
    /** 是否为列表中的最后一个配置项，影响组件的显示动画 */
    isLast: boolean
    disabled?: boolean
    /** Collapse 组件是否展开 */
    open?: boolean
    class?: ClassValue
    /** 配置变化时触发 */
    onchange?: (...args: unknown[]) => void
  } = $props()

  /** Collapse 组件根元素 */
  let collapseElement = $state<HTMLElement>()

  const transition = useTransition(
    () => collapseElement,
    () => visible
    // () => isLast
  )

  let openCollapse = $state(false)

  // 如果 transition.finished 为 false, 则等待过渡完成后再展开/收起，避免过渡被打断
  $effect(() => {
    if (transition.finished) {
      openCollapse = open
    } else {
    }
  })

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
  bind:this={
    () => {},
    (node) => {
      collapseElement = node.getElement()
    }
  }
  class={['mb-4', ClassName, transition.class]}
  bind:open={openCollapse}
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
  {#snippet content()}
    {m['list.determine_config.content.description']()}
    <Button class="mt-4" onclick={() => onchange()}>trigger change</Button>
    <Collapse open headerAriaLabel={'test1'} contentAriaLabel={'test1'} class="mt-4">
      {#snippet header()}
        <h4 class="text-md font-medium">test1</h4>
      {/snippet}
      {#snippet content()}
        <Collapse open headerAriaLabel={'test2'} contentAriaLabel={'test2'}>
          {#snippet header()}
            <h4 class="text-md font-medium">test2</h4>
          {/snippet}
          {#snippet content()}
            test2
          {/snippet}
        </Collapse>
      {/snippet}
    </Collapse>
  {/snippet}
</Collapse>

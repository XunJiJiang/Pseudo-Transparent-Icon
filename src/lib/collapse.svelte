<script lang="ts" module>
  let id = 0
</script>

<script lang="ts">
  import Button from '$lib/button.svelte'
  import Icon from '$lib/icon/index.svelte'
  import { type Snippet, setContext, getContext } from 'svelte'
  import { type ClassValue } from 'svelte/elements'
  import { EventBus } from '$utils/eventBus'
  import { debounce } from 'es-toolkit'

  const thisID = id++
  const namespace = `collapse-${thisID}`

  /** 当前组件深度 */
  const depth = getContext<number>('collapse-depth') ?? 0
  setContext('collapse-depth', depth + 1)

  /** 由深度为 0 的根组件创建事件总线 */
  if (depth === 0) {
    // BUG: 总线穿线
    setContext<EventBus>('event-bus', new EventBus())
  }

  let interval: number

  /** 监听事件总线 */
  const eventBus = getContext<EventBus>('event-bus')

  $effect(() => {
    // 监听来自子组件的高度更新事件，参数为子组件的深度
    const unlisten = eventBus.subscribe(
      `height-update`,
      (_depth: number, timeout = 300, times = 1) => {
        if (_depth <= depth) {
          return
        }

        clearInterval(interval)
        console.log(depth, _depth, thisID)

        if (times <= 0) {
          times = 1
        }

        /** 单次延时 */
        const singleTimeout = timeout / times

        /** 已经执行次数 */
        let executedTimes = 0

        interval = setInterval(() => {
          recalculateHeight()
          executedTimes++
          console.count('recalculateHeight called')
          if (executedTimes >= times) {
            clearInterval(interval)
          }
        }, singleTimeout)

        // for (let i = 1; i < times; i++) {
        //   setTimeout(() => {
        //     recalculateHeight()
        //   }, singleTimeout * i)
        // }
      }
    )

    return unlisten
  })

  let {
    class: className,
    open = $bindable(false),
    onHeightChange,
    ontoggle,
    onopen,
    onclose,
    header,
    content,
    headerAriaLabel,
    contentAriaLabel,
    disabled = false
  }: {
    class?: ClassValue
    open?: boolean
    /** 内容高度变化时触发，参数为新的高度和旧的高度 */
    onHeightChange?: (height: number, oldHeight?: number) => void
    /** 用户交互时触发 */
    ontoggle?: (isOpen: boolean) => void
    /** 打开时触发, 不限于用户交互 */
    onopen?: () => void
    /** 关闭时触发, 不限于用户交互 */
    onclose?: () => void
    header: Snippet
    content: Snippet<[(height?: number) => void]>
    headerAriaLabel?: string
    contentAriaLabel?: string
    /** 仅禁用展开/收起功能，不影响内容的交互 */
    disabled?: boolean
  } = $props()

  function toggle() {
    open = !open
    ontoggle?.(open)
    eventBus.publish(`height-update`, depth, 300, 2)
  }

  $effect(() => {
    if (open) {
      onopen?.()
    } else {
      onclose?.()
    }
  })

  let buttonContentElement = $state<HTMLElement>()
  /** 按钮的高度，用于计算图标的垂直居中位置 */
  let buttonHeight = $derived(buttonContentElement?.offsetHeight ?? 0)

  let mainElement = $state<HTMLElement>()
  // 当 open 变化时，调整 mainElement 的高度以触发过渡动画
  $effect(() => {
    if (!mainElement) {
      return
    }

    if (open) {
      requestAnimationFrame(() => {
        if (!mainElement) {
          return
        }
        mainElement.style.height = 'auto'
        const height = mainElement.offsetHeight
        mainElement.style.height = '0'
        requestAnimationFrame(() => {
          if (!mainElement) {
            return
          }
          mainElement.style.height = `${height}px`
          eventBus.publish(`height-update`, depth, 300, 2)
        })
      })
    } else {
      mainElement.style.height = '0'
      eventBus.publish(`height-update`, depth, 300, 2)
    }
  })

  let renderContent = $state(false)
  // 在打开时延迟渲染内容
  // 在关闭动画结束后卸载内容
  $effect(() => {
    if (open) {
      renderContent = true
    } else {
      const timeout = setTimeout(() => {
        renderContent = false
      }, 300) // 这个时间应该和 CSS 中的过渡时间一致
      return () => clearTimeout(timeout)
    }
  })

  /** 重新计算 main 高度 */
  export const recalculateHeight = debounce((height?: number) => {
    if (open && mainElement) {
      if (height !== void 0) {
        const oldHeight = mainElement.offsetHeight

        if (height === oldHeight) {
          return
        }

        mainElement.style.height = `${height}px`
        onHeightChange?.(height, oldHeight)
        eventBus.publish(`height-update`, depth, 300, 2)
        return
      }

      const oldHeight = mainElement.offsetHeight
      mainElement.style.height = 'auto'
      const _height = mainElement.offsetHeight
      mainElement.style.height = `${oldHeight}px`

      if (_height === oldHeight) {
        return
      }

      requestAnimationFrame(() => {
        if (!mainElement) {
          return
        }
        mainElement.style.height = `${_height}px`
        onHeightChange?.(_height, oldHeight)
        eventBus.publish(`height-update`, depth, 300, 2)
      })
    }
  }, 30)
</script>

<div
  class={[
    'mt-4 rounded-2xl border-2 border-[#535353] bg-transparent p-2 backdrop-blur-sm dark:border-[#9f9f9f]',
    disabled ? 'border-[#53535366] dark:border-[#9f9f9f66]!' : '',
    depth > 0 ? 'mt-1! mb-1 rounded-lg' : '',
    className
  ]}
>
  <header aria-label={headerAriaLabel}>
    <Button
      style={open ? 'secondary' : 'outline'}
      class="flex w-full ps-2 pe-2"
      onclick={toggle}
      {disabled}
    >
      <div
        bind:this={buttonContentElement}
        class="w-[calc(100%-1.5em)] flex-1 text-left wrap-break-word"
      >
        {@render header()}
      </div>
      <div>
        <Icon
          iconName="chevron-left"
          class={[open ? '-rotate-90' : '', 'transition-transform']}
          origin="vscode"
          top={buttonHeight / 2 - 19.2 / 2}
          size={1.2}
        />
      </div>
    </Button>
  </header>
  <main
    bind:this={mainElement}
    class={['overflow-hidden transition-[height] duration-300 ease-[cubic-bezier(.26,.87,.26,1)]']}
    aria-label={contentAriaLabel}
  >
    {#if renderContent}
      <div class="ps-2 pe-2 pt-3 pb-1.5 text-left">
        {@render content(recalculateHeight)}
      </div>
    {/if}
  </main>
</div>

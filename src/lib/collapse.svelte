<script lang="ts" module>
  let id = 0
</script>

<script lang="ts">
  import Button from '$lib/button.svelte'
  import Icon from '$lib/icon/index.svelte'
  import { type Snippet, setContext, getContext } from 'svelte'
  import { type ClassValue } from 'svelte/elements'
  import { EventBus } from '$utils/eventBus'
  import { useHeightUpdateSubscriber } from '$utils/heightUpdate.svelte'

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

  /** 监听事件总线 */
  const eventBus = getContext<EventBus>('event-bus')

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
    content: Snippet<[(info: { height?: number; changeHeight?: number }) => void]>
    headerAriaLabel?: string
    contentAriaLabel?: string
    /** 仅禁用展开/收起功能，不影响内容的交互 */
    disabled?: boolean
  } = $props()

  /** 根元素 */
  let rootElement = $state<HTMLElement>()

  export const getElement = () => rootElement

  /** 重新计算 main 高度 */
  export const recalculateHeight = ({
    height,
    changeHeight
  }: { height?: number; changeHeight?: number } = {}) => {
    if (open && mainElement) {
      if (height !== void 0) {
        const oldHeight = mainElement.offsetHeight

        if (height === oldHeight) {
          return
        }

        mainElement.style.height = `${height}px`
        setCurrentHeight(height)
        onHeightChange?.(height, oldHeight)
        return
      }

      if (changeHeight !== void 0) {
        if (changeHeight === 0) {
          return
        }

        const oldHeight = parseFloat(mainElement.style.height) ?? mainElement.offsetHeight
        const newHeight = oldHeight + changeHeight

        if (newHeight <= 0) {
          return
        }

        setCurrentHeight(newHeight)
        mainElement.style.height = `${newHeight}px`
        onHeightChange?.(newHeight, oldHeight)
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
        setCurrentHeight(_height)
        onHeightChange?.(_height, oldHeight)
      })
    }
  }

  const {
    publishHeightUpdate,
    getLastIsRender,
    setLastIsRender,
    getCurrentHeight,
    setCurrentHeight
  } = useHeightUpdateSubscriber(eventBus, depth, () => open, recalculateHeight)

  function toggle() {
    open = !open
    ontoggle?.(open)
  }

  $effect(() => {
    if (open) {
      onopen?.()
    } else {
      onclose?.()
    }
  })

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
          setCurrentHeight(height)
          publishHeightUpdate(getCurrentHeight())
        })
      })
    } else {
      mainElement.style.height = '0'
      publishHeightUpdate(-getCurrentHeight())
      setCurrentHeight(0)
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
        setLastIsRender(false)
      }, 300) // 这个时间应该和 CSS 中的过渡时间一致
      return () => clearTimeout(timeout)
    }
  })
</script>

<div
  bind:this={rootElement}
  class={[
    'rounded-2xl border-2 border-[#535353] bg-transparent p-2 backdrop-blur-sm dark:border-[#9f9f9f]',
    disabled ? 'border-[#53535366] dark:border-[#9f9f9f66]!' : '',
    depth > 0 ? 'rounded-lg' : '',
    className
  ]}
>
  <header aria-label={headerAriaLabel}>
    <Button
      style={open ? 'secondary' : 'outline'}
      class="flex w-full items-center ps-2 pe-2"
      onclick={toggle}
      {disabled}
    >
      <div class="w-[calc(100%-1.5em)] flex-1 text-left wrap-break-word">
        {@render header()}
      </div>
      <div>
        <Icon
          iconName="chevron-left"
          class={[open ? '-rotate-90' : '', 'transition-transform ']}
          origin="vscode"
          top={3}
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
      <div class="ps-2 pe-2 pt-3 pb-2 text-left">
        {@render content(recalculateHeight)}
      </div>
    {/if}
  </main>
</div>

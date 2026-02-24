<script lang="ts">
  import { type Snippet } from 'svelte'
  import Button from '$lib/button.svelte'
  import Icon from '$lib/icon/index.svelte'
  import { type ClassValue } from 'svelte/elements'

  let {
    class: className,
    open = $bindable(false),
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
    ontoggle?: (isOpen: boolean) => void
    onopen?: () => void
    onclose?: () => void
    header: Snippet
    content: Snippet
    headerAriaLabel?: string
    contentAriaLabel?: string
    /** 仅禁用展开/收起功能，不影响内容的交互 */
    disabled?: boolean
  } = $props()

  function toggle() {
    open = !open
    ontoggle?.(open)
    if (open) {
      onopen?.()
    } else {
      onclose?.()
    }
  }

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
        })
      })
    } else {
      mainElement.style.height = '0'
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
</script>

<div
  class={[
    'mb-4 rounded-2xl border-2 border-[#535353] bg-transparent p-2 backdrop-blur-sm dark:border-[#9f9f9f]',
    disabled ? 'border-[#53535366] dark:border-[#9f9f9f66]!' : '',
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
        {@render content()}
      </div>
    {/if}
  </main>
</div>

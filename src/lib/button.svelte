<script lang="ts" module>
  export const STYLE_MAP = {
    // TODO
    primary:
      'text-[#fff] bg-[#000a] border-[#5550] hover:border-[#999] focus:ring-gray-600 focus:ring-offset-[#eee] disabled:bg-gray-100 disabled:text-gray-400 dark:text-[#000] dark:bg-[#fffc] dark:border-[#5550] dark:hover:border-[#777] dark:focus:ring-gray-300 dark:focus:ring-offset-[#242424] dark:disabled:bg-[#343434] dark:disabled:text-[#999]',
    secondary:
      'bg-[#8885] border-[#5550] hover:border-[#bbb] focus:ring-gray-600 focus:ring-offset-[#eee] disabled:bg-gray-100 disabled:text-gray-400 dark:bg-[#6666] dark:border-[#5550] dark:hover:border-[#555] dark:focus:ring-gray-300 dark:focus:ring-offset-[#242424] dark:disabled:bg-[#343434] dark:disabled:text-[#999]',
    danger:
      // TODO
      'bg-[#8885] border-[#5550] hover:border-[#bbb] focus:ring-gray-600 focus:ring-offset-[#eee] disabled:bg-gray-100 disabled:text-gray-400 dark:bg-[#6666] dark:border-[#5550] dark:hover:border-[#555] dark:focus:ring-gray-300 dark:focus:ring-offset-[#242424] dark:disabled:bg-[#343434] dark:disabled:text-[#999]',
    text: 'bg-[#8885] border-[#5550] hover:border-[#bbb] focus:ring-gray-600 focus:ring-offset-[#eee] disabled:bg-gray-100 disabled:text-gray-400 dark:bg-[#6666] dark:border-[#5550] dark:hover:border-[#555] dark:focus:ring-gray-300 dark:focus:ring-offset-[#242424] dark:disabled:bg-[#343434] dark:disabled:text-[#999]',
    link: 'bg-[#0000] border-[#0000] disabled:bg-gray-100 disabled:text-gray-400 dark:bg-[#0000] dark:border-[#0000] dark:disabled:bg-[#343434] dark:disabled:text-[#999] hover:underline focus:ring-gray-600 focus:ring-offset-[#eee] dark:focus:ring-gray-300 dark:focus:ring-offset-[#242424]',
    outline:
      'bg-[#0000] border-[#0000] hover:bg-[#8885] focus:ring-gray-600 focus:ring-offset-[#eee] disabled:text-gray-400 dark:bg-[#0000] dark:border-[#0000] dark:hover:bg-[#6666] dark:focus:ring-gray-300 dark:focus:ring-offset-[#242424] dark:disabled:bg-[#0000] dark:disabled:text-[#999]'
  } as const
</script>

<script lang="ts">
  import type { Snippet } from 'svelte'

  const {
    disabled = false,
    children,
    onclick = () => {},
    class: className,
    type = 'button',
    style = 'primary',
    ariaLabel = '',
    ariaDescribedBy = '',
    ariaPressed = undefined,
    tabIndex = 0,
    role = 'button'
  }: {
    disabled?: boolean
    children?: Snippet
    onclick?: (event: MouseEvent) => void
    class?: string
    type?: 'button' | 'submit' | 'reset'
    style?: 'primary' | 'secondary' | 'danger' | 'text' | 'link' | 'outline'
    ariaLabel?: string // ARIA 标签, 用于无障碍访问
    ariaDescribedBy?: string // ARIA 描述, 用于无障碍访问
    ariaPressed?: boolean // ARIA 按压状态, 用于无障碍访问
    tabIndex?: number // 可聚焦性, 默认为 0
    role?: string // ARIA 角色, 默认为 'button'
  } = $props()
</script>

<button
  class={[
    'cursor-pointer rounded-lg border-2 p-1 transition-colors duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed',
    STYLE_MAP[style],
    className
  ]}
  onclick={(event) => onclick(event)}
  {disabled}
  {type}
  aria-label={ariaLabel}
  aria-describedby={ariaDescribedBy}
  aria-pressed={ariaPressed}
  tabindex={tabIndex}
  {role}
>
  {@render children?.()}
</button>

<script lang="ts">
  import { STYLE_MAP } from './button.svelte'
  import Icon from '$lib/icon/index.svelte'
  import type { Snippet } from 'svelte'

  const {
    children,
    href = '#',
    target = '_blank',
    class: className = '',
    style = 'link',
    ariaLabel = '',
    role = 'link',
    ariaDescribedBy = '',
    tabIndex = 0,
    ariaCurrent = void 0,
    ...rest
  }: {
    children: Snippet
    href?: string
    target?: string
    class?: string
    style?: 'link' | 'outline' | 'text'
    ariaLabel?: string // ARIA 标签, 用于无障碍访问
    role?: string // ARIA 角色, 默认为 'link'
    ariaDescribedBy?: string // ARIA 描述, 用于无障碍访问
    tabIndex?: number // 可聚焦性, 默认为 0
    ariaCurrent?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false' // ARIA 当前状态, 用于无障碍访问
    [key: string]: any
  } = $props()
</script>

<a
  class={[
    'cursor-pointer rounded-lg border-2 p-1 transition-colors duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed',
    'link' === style ? STYLE_MAP[style].replace('hover:underline', '') : STYLE_MAP[style],
    'inline-flex items-center gap-1',
    className
  ]}
  {href}
  {target}
  {...rest}
  aria-label={ariaLabel}
  {role}
  aria-describedby={ariaDescribedBy}
  tabindex={tabIndex}
  aria-current={ariaCurrent}
>
  {#if style === 'link'}
    <span class="flex items-end">
      <Icon iconName="link" origin="vscode" size={1.2} />
    </span>
  {/if}
  <span class={['link' === style ? 'hover:underline' : null]}>
    {@render children?.()}
  </span>
</a>

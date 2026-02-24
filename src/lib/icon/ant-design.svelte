<script lang="ts">
  import * as icons from '@ant-design/icons-svg'
  import { renderIconDefinitionToSVGElement } from '@ant-design/icons-svg/es/helpers'
  import type { ClassValue } from 'svelte/elements'

  type IconDefinition = keyof typeof icons

  const {
    className,
    iconName,
    size,
    color = 'currentColor',
    top,
    bottom,
    left,
    right
  }: {
    className?: ClassValue
    iconName: string
    size: number
    color?: string
    top?: number | string
    bottom?: number | string
    left?: number | string
    right?: number | string
  } = $props()

  const positionStyles = $derived(
    (
      [
        { key: 'top', value: top },
        { key: 'bottom', value: bottom },
        { key: 'left', value: left },
        { key: 'right', value: right }
      ] as const
    )
      .filter((item) => item.value !== undefined && item.value !== null)
      .reduce(
        (acc, item) => {
          acc[item.key] =
            typeof item.value === 'number' ? `${item.value}px` : (item.value as string)
          return acc
        },
        {} as Record<'top' | 'bottom' | 'left' | 'right', string>
      )
  )

  /** 将字面量从 短横线 转为 大驼峰 */
  function toPascalCase(str: string): string {
    return str
      .split('-')
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join('')
  }

  /** 获取图标组件 */
  function getIconComponent(iconName: string) {
    const pascalName = toPascalCase(iconName)

    if (
      !pascalName ||
      !(pascalName in icons) ||
      typeof icons[pascalName as IconDefinition] === 'undefined'
    ) {
      return null
    }

    const iconDef = icons[pascalName as IconDefinition]
    if (!iconDef) {
      return null
    }
    return renderIconDefinitionToSVGElement(iconDef, {
      extraSVGAttrs: {
        width: `${size}em`,
        height: `${size}em`,
        fill: color
      }
    })
  }

  const svgHTMLString = $derived(getIconComponent(iconName))
</script>

{#if svgHTMLString}
  <span
    class={['relative', className]}
    style={Object.entries(positionStyles)
      .map(([key, value]) => `${key}: ${value};`)
      .join(' ')}>{@html svgHTMLString}</span
  >
{:else}
  <span class="icon-not-found"></span>
{/if}

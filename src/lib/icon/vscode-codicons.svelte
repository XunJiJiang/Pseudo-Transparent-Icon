<script lang="ts" module>
  import '@vscode/codicons/dist/codicon.css'
</script>

<script lang="ts">
  import '@vscode/codicons/dist/codicon.css'

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
    className?: string
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
</script>

<span
  class={[`codicon codicon-${iconName} relative`, className]}
  style={`font-size: ${size}em; color: ${color}; ${Object.entries(positionStyles)
    .map(([key, value]) => `${key}: ${value};`)
    .join(' ')}`}
></span>

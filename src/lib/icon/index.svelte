<script lang="ts">
  import VscIcon from './vscode-codicons.svelte'
  import AntIcon from './ant-design.svelte'
  const {
    class: className = '',
    origin = 'vscode',
    iconName,
    size = 1,
    color = 'currentColor',
    top,
    bottom,
    left,
    right
  }: {
    class?: string
    origin?: 'ant' | 'vscode'
    iconName: string
    size?: number
    color?: string
    top?: number | string
    bottom?: number | string
    left?: number | string
    right?: number | string
  } = $props()
</script>

{#if origin === 'ant'}
  <AntIcon {className} {iconName} {size} {color} {top} {bottom} {left} {right} />
{:else if origin === 'vscode'}
  <VscIcon {className} {iconName} {size} {color} {top} {bottom} {left} {right} />
{:else}
  <span class="icon-not-found">{($inspect(`Invalid icon origin: ${origin}`), '')}</span>
{/if}

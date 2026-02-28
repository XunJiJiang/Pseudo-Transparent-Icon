<script lang="ts">
  import { m } from '$lib/paraglide/messages'
  import Collapse from '$lib/collapse.svelte'
  import type { ClassValue } from 'svelte/elements'
  import { useTransition } from './utils/transition.svelte'
  import Button from '$lib/button.svelte'
  import Radio from '$lib/radio.svelte'

  type TIconPositionConfig = {
    /** 要求的背景图尺寸 */
    backgroundSize: {
      width: number
      height: number
    }
    /** 图标位置列表，单位为像素，左上角为原点 */
    iconPositions: {
      x: number
      y: number
      width: number
      height: number
    }[]
  }

  type TConfig =
    | {
        iconPositionConfig: TIconPositionConfig
      }
    | {
        type: 'create-config'
      }

  let {
    visible,
    isLast,
    disabled = false,
    open = $bindable(false),
    class: className,
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
    onchange?: (config: TConfig | null) => void
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
    }
  })

  let timeout: number

  $effect(() => {
    if (open === openCollapse) {
      return
    }
    timeout = setTimeout(() => {
      open = openCollapse
    }, 300)
  })

  let importFileName = $state('')

  let radioElement = $state<Radio>()
  let radioValue = $state<'import-config' | 'create-config' | TIconPositionConfig>()

  /** 检查导入的文件是否符合类型要求 */
  function validateConfig(config: any): config is TIconPositionConfig {
    if (
      typeof config !== 'object' ||
      typeof config.backgroundSize !== 'object' ||
      typeof config.backgroundSize.width !== 'number' ||
      typeof config.backgroundSize.height !== 'number' ||
      !Array.isArray(config.iconPositions)
    ) {
      return false
    }
    for (const pos of config.iconPositions) {
      if (
        typeof pos !== 'object' ||
        typeof pos.x !== 'number' ||
        typeof pos.y !== 'number' ||
        typeof pos.width !== 'number' ||
        typeof pos.height !== 'number'
      ) {
        return false
      }
    }
    return true
  }

  /** 导入配置 */
  function importConfig() {
    // 导入文件
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = false
    input.accept = '.json'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) {
        radioElement?.reset()
        return
      }
      importFileName = file.name
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string)
          if (validateConfig(json)) {
            onchange({
              iconPositionConfig: json
            })
          } else {
            console.error('Invalid config file')
          }
        } catch (err) {
          console.error('Failed to parse JSON:', err)
        }
      }
      reader.readAsText(file)
    }
    input.oncancel = () => {
      radioElement?.reset()
      onchange(null)
    }
    input.click()
  }

  /**
   * 重置配置项到初始状态
   */
  export function reset() {
    importFileName = ''
    radioElement?.reset()
  }

  /**
   * 获取当前配置项的值
   */
  export function getConfig(): TConfig | null {
    return null
  }
</script>

<Collapse
  bind:this={
    () => {},
    (node) => {
      collapseElement = node.getElement()
    }
  }
  class={['mb-4', className, transition.class]}
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
    <Button class="p-1 ps-2.5 pe-2.5 text-[1em] font-medium" onclick={() => onchange(null)}>
      trigger change
    </Button>
    <Radio
      bind:this={radioElement}
      bind:value={radioValue}
      class="mt-3"
      name="determine-config-options"
      options={[
        {
          label: m['list.determine_config.content.iphone_pro_12_15'](),
          value: {}
        },
        {
          label: m['list.determine_config.content.import_config'](),
          value: 'import-config',
          description: importFileName
            ? m['list.determine_config.content.import_config_description']({
                filename: importFileName
              })
            : undefined
        },
        {
          label: m['list.determine_config.content.create_config'](),
          value: 'create-config'
        }
      ]}
      onchange={(value: 'import-config' | 'create-config' | TIconPositionConfig) => {
        if (value === 'create-config') {
          onchange({
            type: 'create-config'
          })
        } else if (value === 'import-config') {
          importConfig()
        } else {
          onchange({
            iconPositionConfig: value
          })
        }
      }}
    />
  {/snippet}
</Collapse>

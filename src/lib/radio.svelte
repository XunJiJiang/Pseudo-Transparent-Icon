<script lang="ts" module>
  let id = 0
</script>

<script lang="ts">
  import type { Snippet } from 'svelte'
  import { type ClassValue } from 'svelte/elements'
  import Button, { STYLE_MAP } from '$lib/button.svelte'
  import Icon from '$lib/icon/index.svelte'

  let {
    name = `radio-${id++}`,
    value = $bindable(null),
    disabled = false,
    class: className,
    onchange = () => {},
    options
  }: {
    name?: string
    value?: any
    disabled?: boolean
    class?: ClassValue
    onchange?: (value: any) => void
    options: {
      label: string | Snippet<[boolean]>
      description?: string
      value: any
      class?: ClassValue
      disabled?: boolean
      onchoice?: () => void
    }[]
  } = $props()

  export function reset() {
    value = null
  }
</script>

<div
  class={[
    'flex flex-col rounded-lg border-2 border-[#535353] bg-transparent p-2 backdrop-blur-sm dark:border-[#9f9f9f]',
    className
  ]}
>
  {#each options as option, index}
    {#snippet label(checked: boolean)}
      {#if typeof option.label === 'string'}
        <div class="flex w-full items-center">
          <div class="flex-1 truncate" title={option.label}>
            {#if option.description}
              <div class="text-sm font-medium">{option.label}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                {option.description}
              </div>
            {:else}
              <div>{option.label}</div>
            {/if}
          </div>
          <div
            class={[
              'ml-2 h-4 w-5.5 flex-none shrink-0 text-white',
              checked ? 'visible' : 'invisible'
            ]}
          >
            <Icon bottom={1} iconName="check" origin="vscode" size={1.1} />
          </div>
        </div>
      {:else}
        {@render option.label(checked)}
      {/if}
    {/snippet}
    <label>
      <Button
        style={$state.snapshot(value) === $state.snapshot(option.value) ? 'secondary' : 'outline'}
        class={[
          'flex w-full items-center text-left wrap-break-word',
          'focus:relative focus:z-1 focus:rounded-xs',
          index === 0
            ? 'rounded-t-xs rounded-b-none'
            : index === options.length - 1
              ? 'rounded-t-none rounded-b-xs'
              : 'rounded-none'
        ]}
        disabled={disabled || option.disabled}
        onclick={() => {
          if (disabled || option.disabled) {
            return
          }
          value = option.value
          onchange(value)
          option.onchoice?.()
        }}
      >
        <input
          class={['hidden']}
          type="radio"
          {name}
          value={option.value}
          disabled={disabled || option.disabled}
          checked={$state.snapshot(value) === $state.snapshot(option.value)}
          onchange={() => {
            if (disabled || option.disabled) {
              return
            }
            value = option.value
            onchange(value)
          }}
        />
        {@render label($state.snapshot(value) === $state.snapshot(option.value))}
      </Button>
    </label>
  {/each}
</div>

<script lang="ts">
  import { m } from '$lib/paraglide/messages'
  import DetermineConfig from './modules/determine-config.svelte'
  import CreateConfig from './modules/create-config.svelte'
  import ImportBackground from './modules/import-background.svelte'
  import CustomIcons from './modules/custom-icons.svelte'

  let visibleStates = $state([
    false, // DetermineConfig 可见
    false, // CreateConfig 可见
    false, // ImportBackground 可见
    false // CustomIcons 可见
  ])

  for (let i = 0; i < visibleStates.length; i++) {
    setTimeout(() => {
      if (i === 1) {
        i++
      }
      visibleStates[i] = true
    }, i * 150) // 每个组件依次延迟 300ms 显示
  }

  setTimeout(() => {
    visibleStates[2] = false
  }, 5000)
</script>

<div class="m-auto mt-4 max-w-2xl wrap-break-word">
  <!-- {#if visibleStates[0]} -->
  <DetermineConfig
    open
    visible={visibleStates[0]}
    isLast={false}
    class={{
      'mb-0 rounded-b-none': visibleStates[1]
    }}
    onchange={() => {
      visibleStates[1] = !visibleStates[1]
    }}
  />
  <!-- {/if} -->
  <!-- {#if visibleStates[1]} -->
  <CreateConfig
    open
    visible={visibleStates[1]}
    isLast={false}
    class={{
      'mt-0! rounded-t-none border-t-0': visibleStates[0]
    }}
  />
  <!-- {/if} -->
  <!-- {#if visibleStates[2]} -->
  <ImportBackground open visible={visibleStates[2]} isLast={false} />
  <!-- {/if} -->
  <!-- {#if visibleStates[3]} -->
  <CustomIcons open visible={visibleStates[3]} isLast={true} />
  <!-- {/if} -->
</div>

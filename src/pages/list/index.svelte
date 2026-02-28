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

  $effect(() => {
    // for (let i = 0; i < visibleStates.length; i++) {
    //   setTimeout(() => {
    //     visibleStates[i] = true
    //   }, i * 100) // 每个组件依次延迟 300ms 显示
    // }
  })

  export function start() {
    for (let i = 0; i < visibleStates.length; i++) {
      setTimeout(
        () => {
          visibleStates[i] = !visibleStates[i]
        },
        600 - i * 200
      ) // 每个组件依次延迟 300ms 显示
    }
  }
</script>

<div class="m-auto mt-4 max-w-2xl wrap-break-word">
  <DetermineConfig
    open
    visible={visibleStates[0]}
    isLast={false}
    class={{
      'mb-0! rounded-b-none': visibleStates[1]
    }}
    onchange={() => {
      visibleStates[1] = !visibleStates[1]
    }}
  />
  <CreateConfig
    open
    visible={visibleStates[1]}
    isLast={false}
    class={{
      'mt-0 rounded-t-none border-t-0': visibleStates[0]
    }}
  />
  <ImportBackground open visible={visibleStates[2]} isLast={false} />
  <CustomIcons open visible={visibleStates[3]} isLast={true} />
</div>

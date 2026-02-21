<script lang="ts">
  import Button, { STYLE_MAP } from '$/lib/button.svelte'
  import Icon from '$lib/icon/index.svelte'
  import { m } from '$lib/paraglide/messages'
  import { setLocale, getLocale, locales } from '$lib/paraglide/runtime'

  /** 获取下一个语言 */
  function nextLocale() {
    const current = getLocale()
    const index = locales.findIndex((l) => l === current)
    return locales[(index + 1) % locales.length]
  }
</script>

<header class="sticky top-0 min-w-screen">
  <div
    class={[
      'max-w-[100vw] border-b border-b-[#555] px-4 text-center leading-relaxed md:text-left',
      'bg-container'
    ]}
  >
    <div class="m-auto flex h-16 max-w-7xl items-center justify-between">
      <!-- 左侧容器 -->
      <div class="mr-8 flex flex-col items-center leading-1.5 md:items-start">
        <h1 class=" text-[20px] font-bold">{m['hero.title']()}</h1>
      </div>
      <!-- 中间容器（可选） -->
      <div class="mx-8 w-px">中</div>
      <!-- 右侧容器 -->
      <div class="ml-8 flex items-center space-x-0.5 leading-1.5 md:mt-0 md:items-end">
        <Button onclick={() => setLocale(nextLocale())} style="outline">
          <Icon
            left={1}
            origin="ant"
            iconName="translation-outlined"
            size={1.2}
            color="currentColor"
          />
        </Button>
        <a
          class={[
            'cursor-pointer rounded-lg border-2 p-1 transition-colors duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed',
            STYLE_MAP['outline'],
            'text-1.5 pr-1'
          ]}
          href="https://github.com/XunJiJiang/Pseudo-Transparent-Icon"
          target="_blank"
        >
          <Icon right={1} origin="vscode" iconName="github-alt" size={1.2} color="currentColor" />
        </a>
      </div>
    </div>
  </div>
</header>

<style>
  .bg-container {
    background-image: radial-gradient(transparent 1px, var(--bg-color, #242424) 1px);
    background-size: 4px 4px;
    backdrop-filter: saturate(0.5) blur(4px);
  }
</style>

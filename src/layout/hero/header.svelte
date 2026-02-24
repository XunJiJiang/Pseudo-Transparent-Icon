<script lang="ts">
  import Button from '$/lib/button.svelte'
  import Link from '$lib/link.svelte'
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
      'max-w-[100vw] border-b border-b-[#999] px-4 text-center leading-relaxed md:text-left dark:border-b-[#555]',
      'bg-container'
    ]}
  >
    <div class="m-auto flex h-16 max-w-7xl items-center justify-between">
      <!-- 左侧容器 -->
      <div class="mr-8 flex flex-col items-center leading-1.5 md:items-start">
        <h1 class=" text-[20px] font-bold">{m['hero.title']()}</h1>
      </div>
      <!-- 中间容器（可选） -->
      <div class="mx-8 w-px"></div>
      <!-- 右侧容器 -->
      <div class="ml-8 flex items-center space-x-0.5 leading-1.5 md:mt-0 md:items-end">
        <Button
          onclick={() => setLocale(nextLocale())}
          style="outline"
          ariaLabel={m['hero.change_language.aria_label']()}
        >
          <Icon
            left={1}
            origin="ant"
            iconName="translation-outlined"
            size={1.2}
            color="currentColor"
          />
          <!-- 这个是 google 翻译的图标, 不知道能不能用 -->
          <!-- <svg width="24" height="24" viewBox="0 0 24 24" focusable="false" class="ep0rzf NMm5M"
            ><path
              d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"
            ></path>
          </svg> -->
        </Button>
        <Link
          class="pr-1"
          style="outline"
          href="https://github.com/XunJiJiang/Pseudo-Transparent-Icon"
          target="_blank"
          ariaLabel={m['hero.github.aria_label']()}
        >
          <Icon right={0.5} origin="vscode" iconName="github-alt" size={1.2} color="currentColor" />
        </Link>
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

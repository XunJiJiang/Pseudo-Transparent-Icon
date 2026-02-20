<script lang="ts">
  import { m } from '@lib/paraglide/messages'
  import { setLocale, getLocale, locales } from '@lib/paraglide/runtime'

  import { TranslationOutlined } from '@ant-design/icons-svg'
  import { renderIconDefinitionToSVGElement } from '@ant-design/icons-svg/es/helpers'

  const svgHTMLString = renderIconDefinitionToSVGElement(TranslationOutlined, {
    extraSVGAttrs: { width: '1em', height: '1em', fill: 'currentColor' }
  })

  /** 获取下一个语言 */
  function nextLocale() {
    const current = getLocale()
    const index = locales.findIndex((l) => l === current)
    return locales[(index + 1) % locales.length]
  }
</script>

<main>
  <p>{m.hello_world({ name: 'svelte' })}</p>

  <button onclick={() => setLocale(nextLocale())}>{@html svgHTMLString}</button>
</main>

<style>
</style>

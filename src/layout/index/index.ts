import html from './index.html?raw'
import css from './index.scss?raw'
import { define, effect, onMounted, ref, refTemplate } from 'xj-web-core/index'
import throttling from '@utils/throttling'
import exposeTemplate from 'xj-web-core/exposeTemplate'

type BgColorType = 'pure' | 'vague'

const setBodyBgColor = (type: BgColorType) => {
  document.body.classList.remove('pure')
  document.body.classList.remove('vague')
  document.body.classList.add(type)
}

export default define('l-index', {
  template: html,
  style: css,
  setup() {
    const lIndexRef = refTemplate('l-index-ref')
    const headerRef = refTemplate('header-ref')
    const backSpanRef = refTemplate('back-span-ref')
    const titleSpanRef = refTemplate('title-span-ref')
    const views = [
      [refTemplate('v-home-ref'), '首页'],
      [refTemplate('v-sd-type-ref'), '选择设备类型'],
      [refTemplate('v-sd-type-ref2'), '选择设备'],
      [refTemplate('v-sd-type-ref3'), '类型'],
      [refTemplate('v-sd-type-ref4'), '备类型'],
      [refTemplate('v-sd-type-ref5'), '选择设备类型']
    ] as [
      {
        value: HTMLElement | null
      },
      string
    ][]

    /** 当前下标 */
    const index = ref(0)

    const pageList: string[] = []

    const resize = throttling(() => {
      lIndexRef.value?.setAttribute(
        'style',
        `--root-width: ${lIndexRef.value?.offsetWidth || 0}px;`
      )
    })

    onMounted(() => {
      views.forEach((view, i) => {
        view[0].value?.setAttribute(
          'data-style',
          i === index.value ? '' : `transform: translateX(100%);`
        )
      })

      resize()

      window.addEventListener('resize', resize)

      return () => {
        window.removeEventListener('resize', resize)
      }
    })

    let prevIndex = 0

    effect(() => {
      if (!backSpanRef.value || !titleSpanRef.value) return

      const nowIndex = index.value
      views[nowIndex][0].value?.setAttribute(
        'data-style',
        `transform: translateX(0);`
      )

      let nowTitle = views[index.value][1]
      const prevTitle = views[prevIndex][1]

      titleSpanRef.value.classList.remove('add')
      titleSpanRef.value.classList.remove('reduce')

      if (prevIndex > nowIndex) {
        // reduce
        titleSpanRef.value.classList.add('reduce')

        titleSpanRef.value.innerHTML = `
          <span>${nowTitle}</span>
          <span>${prevTitle}</span>
        `
      } else if (prevIndex < nowIndex) {
        // add

        titleSpanRef.value.classList.add('add')

        titleSpanRef.value.innerHTML = `
          <span>${prevTitle}</span>
          <span>${nowTitle}</span>
        `
      }

      return () => {
        if (!backSpanRef.value || !titleSpanRef.value) return

        prevIndex = nowIndex

        const prevTitle = nowTitle

        const leftTitle =
          backSpanRef.value?.querySelector('span:first-child')?.textContent ||
          ''

        views[prevIndex][0].value?.setAttribute(
          'data-style',
          `transform: translateX(${index.value > prevIndex ? '-25%' : '100%'});`
        )

        nowTitle = index.value === 0 ? '' : views[index.value - 1][1]

        backSpanRef.value.classList.remove('add')
        backSpanRef.value.classList.remove('reduce')

        backSpanRef.value.setAttribute(
          'style',
          `width: ${nowTitle.length * 1.07 + 1}rem;`
        )

        if (index.value > prevIndex) {
          pageList.push(prevTitle)

          backSpanRef.value.classList.add('add')
          backSpanRef.value.innerHTML = `
              <span>${nowTitle}</span>
              <span>${leftTitle}</span>
            `
        } else {
          pageList.pop()

          backSpanRef.value.classList.add('reduce')
          backSpanRef.value.innerHTML = `
              <span>${nowTitle}</span>
              <span>${leftTitle}</span>
            `
        }
        if (pageList.length === 0) {
          headerRef.value?.classList.add('hide')
        } else {
          headerRef.value?.classList.remove('hide')
        }
      }
    })

    const setLIndexBgColor = (type: BgColorType) => {
      lIndexRef.value?.classList.remove('pure')
      lIndexRef.value?.classList.remove('vague')
      lIndexRef.value?.classList.add(type)
    }

    const handle = {
      prev() {
        if (index.value === 0) return
        index.value--
      },
      next() {
        if (index.value === views.length - 1) return
        index.value++
      },
      scroll(scrollTop: number) {
        if (scrollTop < 16) {
          setBodyBgColor('pure')
          setLIndexBgColor('pure')
        } else {
          setBodyBgColor('vague')
          setLIndexBgColor('vague')
        }
      }
    }

    const homeExp = exposeTemplate<{
      aaa: number
    }>('home-exp')

    onMounted(() => {
      console.dir(homeExp.value)
    })

    return {
      back() {
        handle.prev()
      },
      ...handle
    }
  }
})

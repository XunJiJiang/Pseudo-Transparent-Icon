// TODO: 当前[next函数]只能增加，不能减少，计划修改为可以增加和减少。目前没有用到，暂时不修改

import html from './index.html?raw'
import css from './index.scss?raw'
import { define, effect, onMounted, ref, refTemplate } from 'xj-web-core/index'
import throttling from '@utils/throttling'
import getStringWidth from '@utils/getStringWidth'

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
      [refTemplate('v-sd-type-ref2'), '选择设备类型2'],
      [refTemplate('v-sd-type-ref3'), '选择设备类型3'],
      [refTemplate('v-sd-type-ref4'), '选择设备类型4']
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
      handle.scroll(0)

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

        views[prevIndex][0].value?.setAttribute(
          'data-style',
          `transform: translateX(${index.value > prevIndex ? '-25%' : '100%'});`
        )

        nowTitle = pageList[pageList.length - 1] ?? ''

        backSpanRef.value.classList.remove('add')
        backSpanRef.value.classList.remove('reduce')

        let stringWidth = 0

        if (index.value > prevIndex) {
          pageList.push(prevTitle)
          stringWidth = getStringWidth(prevTitle, {
            fontSize: '1rem',
            fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif'
          })
          backSpanRef.value.classList.add('add')
          backSpanRef.value.innerHTML = `
              <span>${nowTitle}</span>
              <span>${prevTitle}</span>
            `
        } else {
          const prevTitle = pageList.pop() ?? ''
          const nowTitle = pageList[pageList.length - 1] ?? ''
          stringWidth = getStringWidth(nowTitle, {
            fontSize: '1rem',
            fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif'
          })
          backSpanRef.value.classList.add('reduce')
          backSpanRef.value.innerHTML = `
              <span>${nowTitle}</span>
              <span>${prevTitle}</span>
            `
        }

        backSpanRef.value.setAttribute(
          'style',
          `width: calc(${stringWidth}px + 1.2rem);`
        )

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

    const pageIndexChangeList: number[] = []

    const handle = {
      prev() {
        if (index.value === 0) return
        index.value -= pageIndexChangeList.pop() || 0
      },
      // TODO: [next函数] 此处
      next(num = 1, type: 'relative' | 'absolute' = 'relative') {
        let change = 0
        if (index.value === views.length - 1) return
        if (type === 'absolute') {
          change = num - index.value
          index.value = num
        } else if (type === 'relative') {
          change = num
          index.value += num
        }
        if (index.value > views.length - 1 || index.value < 0) {
          /*@__PURE__*/ console.error('l-index(页面管理): index out of range')
        }
        pageIndexChangeList.push(change)
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

    return {
      back() {
        handle.prev()
      },
      ...handle
    }
  }
})

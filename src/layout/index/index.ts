// TODO: 当前[next函数]只能增加，不能减少，计划修改为可以增加和减少。目前没有用到，暂时不修改

import html from './index.html?raw'
import css from './index.scss?raw'
import {
  createElement,
  define,
  effect,
  onMounted,
  ref,
  refTemplate
} from 'xj-web-core/index'
import throttling from '@utils/throttling'
import getStringWidth from '@utils/getStringWidth'

type BgColorType = 'pure' | 'vague'

const setBodyBgColor = (type: BgColorType) => {
  document.body.classList.remove('pure')
  document.body.classList.remove('vague')
  document.body.classList.add(type)
}

// const COMPONENT_MAX_WIDTH = 'calc(360px + 1.6rem + 1.6rem)'

export default define('l-index', {
  template: html,
  style: css,
  setup() {
    const lIndexRef = refTemplate('l-index-ref')
    const headerRef = refTemplate('header-ref')
    const backSpanRef = refTemplate('back-span-ref')
    const titleSpanRef = refTemplate('title-span-ref')
    const views: [
      {
        value: HTMLElement | null
      },
      string,
      Parameters<typeof createElement>
    ][] = [
      [
        refTemplate('v-home-ref'),
        '首页',
        [
          'v-home',
          {
            ref: 'v-home-ref',
            'on-next': 'next'
          }
        ]
      ],
      [
        refTemplate('v-sd-type-ref'),
        '选择设备类型',
        [
          'v-sd-type',
          {
            ref: 'v-sd-type-ref',
            'on-next': 'next',
            'on-scroll': 'scroll',
            'on-change': 'deviceChange'
          }
        ]
      ],
      [
        refTemplate('v-sd-type-ref2'),
        '选择设备类型2',
        [
          'v-sd-type',
          {
            ref: 'v-sd-type-ref2',
            'on-next': 'next',
            'on-scroll': 'scroll',
            'on-change': 'deviceChange'
          }
        ]
      ],
      [
        refTemplate('v-sd-type-ref3'),
        '选择设备类型3',
        [
          'v-sd-type',
          {
            ref: 'v-sd-type-ref3',
            'on-next': 'next',
            'on-scroll': 'scroll',
            'on-change': 'deviceChange'
          }
        ]
      ],
      [
        refTemplate('v-sd-type-ref4'),
        '选择设备类型4',
        [
          'v-sd-type',
          {
            ref: 'v-sd-type-ref4',
            'on-next': 'next',
            'on-scroll': 'scroll',
            'on-change': 'deviceChange'
          }
        ]
      ]
    ]

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
      const homeEle = createElement(views[0][2][0], views[0][2][1])

      lIndexRef.value?.appendChild(homeEle)

      homeEle.setAttribute('data-status', 'init-show')

      nowELe = homeEle

      // views.forEach((view, i) => {
      //   view[0].value?.setAttribute(
      //     'data-status',
      //     i === index.value ? 'init-show' : `init-hide`
      //   )
      // })

      resize()

      window.addEventListener('resize', resize)

      return () => {
        window.removeEventListener('resize', resize)
      }
    })

    let prevIndex = -1

    // 当前执行的是prev函数还是next函数
    let isPrev: null | boolean = null

    let nowELe: HTMLElement | null = null

    effect(() => {
      if (!backSpanRef.value || !titleSpanRef.value) return

      const nowIndex = index.value

      handle.scroll(0)

      const newEle = createElement(
        views[index.value][2][0],
        views[index.value][2][1]
      )

      const oldEle = nowELe
      nowELe = newEle

      lIndexRef.value?.appendChild(newEle)

      if (prevIndex !== -1 && isPrev !== null) {
        newEle.setAttribute(
          'data-status',
          `${!isPrev ? 'enter-from-right' : 'enter-from-left'}`
        )
      } else {
        newEle.setAttribute('data-status', 'init-show')
      }

      setTimeout(() => {
        oldEle?.remove()
      }, 500)

      let nowTitle = views[index.value][1]
      const prevTitle = prevIndex >= 0 ? views[prevIndex][1] : views[0][1]

      titleSpanRef.value.classList.remove('add')
      titleSpanRef.value.classList.remove('reduce')

      if (isPrev && isPrev !== null) {
        // reduce
        titleSpanRef.value.innerHTML = `
          <span>${nowTitle}</span>
          <span>${prevTitle}</span>
        `
        titleSpanRef.value.classList.add('reduce')
      } else if (isPrev !== null) {
        // add
        titleSpanRef.value.innerHTML = `
          <span>${prevTitle}</span>
          <span>${nowTitle}</span>
        `
        titleSpanRef.value.classList.add('add')
      }

      console.log('nowTitle', nowTitle)

      return () => {
        console.log('remove', nowTitle)
        if (!backSpanRef.value || !titleSpanRef.value) return

        prevIndex = nowIndex

        const prevTitle = nowTitle

        if (isPrev !== null) {
          newEle.setAttribute(
            'data-status',
            `${!isPrev ? 'leave-to-left' : 'leave-to-right'}`
          )
        }

        nowTitle = pageList[pageList.length - 1] ?? ''

        backSpanRef.value.classList.remove('add')
        backSpanRef.value.classList.remove('reduce')

        let stringWidth = 0

        if (!isPrev && isPrev !== null) {
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
        } else if (isPrev !== null) {
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

    /** 记录每次页面变化下标的差 */
    const pageIndexChangeList: number[] = []

    const nextCheck = /*@__PURE__*/ (
      num: number,
      type: 'relative' | 'absolute'
    ) => {
      let err = ''
      if (pageIndexChangeList.reduce((a, b) => a + b, 0) + num === 0) {
        err =
          'l-index(页面管理): 规定第一个页面为首页，不能通过next函数跳转到首页'
      } else if (type === 'absolute' && (num < 0 || num >= views.length)) {
        err = 'l-index(页面管理): 下标越界'
      } else if (
        type === 'relative' &&
        (index.value + num < 0 || index.value + num >= views.length)
      ) {
        err = 'l-index(页面管理): 下标越界'
      } else {
        return
      }
      throw new Error(err)
    }

    const handle = {
      prev: throttling(
        () => {
          if (index.value === 0) return
          isPrev = true
          index.value -= pageIndexChangeList.pop() || 0
        },
        500,
        {
          type: 'once'
        }
      ),
      // TODO: [next函数] 此处
      next: throttling(
        (num = 1, type: 'relative' | 'absolute' = 'relative') => {
          /*@__PURE__*/ nextCheck(num, type)
          isPrev = false
          if (type === 'absolute') {
            pageIndexChangeList.push(num - index.value)
            index.value = num
          } else if (type === 'relative') {
            pageIndexChangeList.push(num)
            index.value += num
          }
        },
        500,
        {
          type: 'once'
        }
      ),
      deviceChange(
        index: number,
        value: {
          label: string
          value: string
        }
      ) {
        console.log(index, value)
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

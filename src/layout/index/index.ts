import html from './index.html?raw'
import css from './index.scss?raw'
import { define, effect, onMounted, ref, refTemplate } from 'xj-web-core/index'

export default define('l-index', {
  template: html,
  style: css,
  setup(_, { expose }) {
    const backRootRef = refTemplate('back-root-ref')
    const backSpanRef = refTemplate('back-span-ref')
    const views = [
      [refTemplate('v-home-ref'), '首页'],
      [refTemplate('v-sd-type-ref'), '选择设备'],
      [refTemplate('v-sd-type-ref2'), '选择设备类型'],
      [refTemplate('v-sd-type-ref3'), '选择'],
      [refTemplate('v-sd-type-ref4'), '选择设备类型'],
      [refTemplate('v-sd-type-ref5'), '选择设备']
    ] as [
      {
        value: HTMLElement | null
      },
      string
    ][]

    /** 当前下标 */
    const index = ref(0)

    const pageList: string[] = []

    onMounted(() => {
      views.forEach((view, i) => {
        view[0].value?.setAttribute(
          'data-style',
          i === index.value ? '' : `transform: translateX(100%);`
        )
        view[0].value?.setAttribute(
          'data-header-style',
          i === index.value ? '' : `opacity: 0; left: -50%;`
        )
      })
    })

    effect(() => {
      const prevIndex = index.value
      views[prevIndex][0].value?.setAttribute(
        'data-style',
        `transform: translateX(0);`
      )
      views[prevIndex][0].value?.setAttribute(
        'data-header-style',
        `opacity: 1; left: 0;`
      )

      const prevTitle = views[index.value][1]

      return () => {
        const leftTitle =
          backSpanRef.value?.querySelector('span:first-child')?.textContent ||
          ''

        views[prevIndex][0].value?.setAttribute(
          'data-style',
          `transform: translateX(${index.value > prevIndex ? '-50%' : '100%'});`
        )
        views[prevIndex][0].value?.setAttribute(
          'data-header-style',
          `opacity: 0;left: ${index.value > prevIndex ? `${leftTitle.length + 3}rem` : '-40%'};`
        )

        const nowTitle = index.value === 0 ? '' : views[index.value - 1][1]

        backSpanRef.value?.classList.remove('add')
        backSpanRef.value?.classList.remove('reduce')

        backSpanRef.value?.setAttribute(
          'style',
          `width: ${nowTitle.length * 1.08}rem;`
        )

        if (index.value > prevIndex) {
          pageList.push(prevTitle)

          if (backSpanRef.value) {
            backSpanRef.value.classList.add('add')
            backSpanRef.value.innerHTML = `
              <span>${nowTitle}</span>
              <span>${leftTitle}</span>
            `
          }
        } else {
          pageList.pop()

          if (backSpanRef.value) {
            backSpanRef.value.classList.add('reduce')
            backSpanRef.value.innerHTML = `
              <span>${nowTitle}</span>
              <span>${leftTitle}</span>
            `
          }
        }
        if (pageList.length === 0) {
          backRootRef.value?.classList.add('hide')
        } else {
          backRootRef.value?.classList.remove('hide')
        }
      }
    })

    const handle = {
      prev() {
        if (index.value === 0) return
        index.value--
      },
      next() {
        if (index.value === views.length - 1) return
        index.value++
      }
    }

    expose(handle)

    return {
      back() {
        handle.prev()
      }
    }
  }
})

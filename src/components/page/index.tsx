// import refTemplate from 'xj-web-core/refTemplate'
import css from './index.scss?raw'
import { defineCustomElement, onMounted, refTemplate } from 'xj-web-core/index'

type PageProps = {
  style: string
  'data-index': string
  'data-status': string
}

type PageEmit = {
  scroll: (scrollTop: number) => void
}

export default defineCustomElement('c-page', {
  style: css,
  observedAttributes: ['data-index', 'data-status'],
  props: {
    style: {
      default: ''
    }
  },
  emit: {
    scroll: {
      default: () => {}
    }
  },
  setup({ style, ...props }: PageProps, { emit }) {
    const pageRootRef = refTemplate('c-page-ref')
    const scroll = (e: Event) => {
      emit<PageEmit>('scroll', (e.target as HTMLElement).scrollTop)
    }
    onMounted(() => {
      pageRootRef.value?.classList.add(`page-${props['data-index'] || '1'}`)
      pageRootRef.value?.setAttribute('style', style as string)

      pageRootRef.value?.addEventListener('scroll', scroll)

      return () => {
        pageRootRef.value?.removeEventListener('scroll', scroll)
      }
    })

    return (
      <div ref="c-page-ref" class="c-page">
        <main>
          <slot name="default"></slot>
        </main>
      </div>
    )
  },
  attributeChanged({ name, newValue }, { data }) {
    if (name === 'data-status') {
      if (!CLASS_LIST.includes(newValue)) {
        throw /*@__PURE__*/ new Error('data-status 属性值不合法')
      }
      this.$defineRefs['c-page-ref']?.setAttribute(
        'class',
        `c-page ${newValue} page-${data['data-index'] || '1'}`
      )
      if (newValue.includes('enter')) {
        this.$defineRefs['c-page-ref']?.scrollTo(0, 0)
      }
    }
  }
})

/** 绑定一次性动画的class */
const CLASS_LIST = [
  'enter-from-left',
  'enter-from-right',
  'leave-to-left',
  'leave-to-right',
  // 初始位置
  'init-show',
  'init-hide'
]

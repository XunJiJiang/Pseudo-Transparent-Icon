import './index.scss'
import { defineCustomElement, onMounted, ref } from 'xj-web-core/index'

export type PageProps = {
  style: string
  'data-index': string
  'data-status': string
}

export type PageEmit = {
  scroll: (scrollTop: number) => void
}

export default defineCustomElement('c-page', {
  observedAttributes: ['data-index', 'data-status'],
  props: {
    style: {
      default: '',
      type: String
    }
  },
  emits: {
    scroll: {
      required: true,
      type: Function as unknown as () => (scrollTop: number) => void
    }
  },
  slots: ['default'],
  setup({ style, ...props }, { emit, share, slot }) {
    const pageRootRef = ref<HTMLDivElement>(null)
    const scroll = (e: Event) => {
      emit('scroll', (e.target as HTMLElement).scrollTop)
    }
    onMounted(() => {
      pageRootRef.value?.classList.add(`page-${props['data-index'] || '1'}`)

      pageRootRef.value?.addEventListener('scroll', scroll)

      return () => {
        pageRootRef.value?.removeEventListener('scroll', scroll)
      }
    })

    share({
      pageRootRef,
      'data-index': props['data-index']
    })

    return (
      <div data-c-page ref={pageRootRef} class="c-page" style={style}>
        <main>{slot.default()}</main>
      </div>
    )
  },
  attributeChanged({ name, newValue }, { data }) {
    if (name === 'data-status') {
      if (!CLASS_LIST.includes(newValue)) {
        throw /*@__PURE__*/ new Error('data-status 属性值不合法')
      }
      data.pageRootRef.value?.setAttribute(
        'class',
        `c-page ${newValue} page-${data['data-index'] || '1'}`
      )
      if (newValue.includes('enter')) {
        data.pageRootRef.value?.scrollTo(0, 0)
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

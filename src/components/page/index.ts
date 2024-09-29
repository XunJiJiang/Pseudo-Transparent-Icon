// import refTemplate from 'xj-web-core/refTemplate'
import html from './index.html?raw'
import css from './index.scss?raw'
import { define, onMounted, refTemplate } from 'xj-web-core/index'

type PageProps = {
  style: string
  'data-index': string
  'data-style': string
}

type PageEmit = {
  scroll: (scrollTop: number) => void
}

export default define('c-page', {
  template: html,
  style: css,
  observedAttributes: ['data-index', 'data-style'],
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
    })
  },
  attributeChanged(name, _oldValue, newValue) {
    if (name === 'data-style') {
      this.$defineRefs['c-page-ref']?.setAttribute('style', newValue)
      if (newValue.includes('transform: translateX(0)')) {
        this.$defineRefs['c-page-ref']?.scrollTo(0, 0)
      }
    }
  }
})

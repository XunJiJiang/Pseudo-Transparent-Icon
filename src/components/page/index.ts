// import refTemplate from 'xj-web-core/refTemplate'
import html from './index.html?raw'
import css from './index.scss?raw'
import { define, onMounted, refTemplate } from 'xj-web-core/index'

export default define('c-page', {
  template: html,
  style: css,
  observedAttributes: ['data-index', 'data-style', 'data-header-style'],
  props: {
    style: {
      default: ''
    }
  },
  setup({ style, ...props }) {
    const pageRootRef = refTemplate('c-page-ref')
    onMounted(() => {
      pageRootRef.value?.classList.add(`page-${props['data-index'] || '1'}`)
      pageRootRef.value?.setAttribute('style', style as string)
    })
  },
  attributeChanged(name, _oldValue, newValue) {
    if (name === 'data-style')
      this.$defineRefs['c-page-ref']?.setAttribute('style', newValue)
    else if (name === 'data-header-style')
      this.$defineRefs['c-header-ref']?.setAttribute('style', newValue)
  }
})

// import refTemplate from 'xj-web-core/refTemplate'
import html from './index.html?raw'
import css from './index.scss?raw'
import { define } from 'xj-web-core/index'

export default define('c-page', {
  template: html,
  style: css,
  observedAttributes: ['data-index'],
  setup() {
    // const pageRootRef = refTemplate('c-page-ref')
  },
  connected() {
    this.$defineRefs['c-page-ref']?.classList.add(
      `page-${this.$props['data-index'] || '1'}`
    )
  }
})

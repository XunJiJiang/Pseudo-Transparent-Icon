// import refTemplate from '@utils/refTemplate'
import html from './index.html?raw'
import css from './index.scss?raw'
import define from '@utils/defineEle'

export default define('c-page', {
  template: html,
  style: css,
  observedAttributes: ['data-index'],
  setup(props) {
    // const pageRootRef = refTemplate('c-page-ref')
    console.log('c-page props', props['data-index'])
  },
  connected() {
    console.log(this.$defineRefs['c-page-ref'], this.$shadowRoot)
    this.$defineRefs['c-page-ref']?.classList.add(
      `page-${this.$props['data-index'] || '1'}`
    )
  }
})

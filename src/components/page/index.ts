// import refTemplate from '@utils/refTemplate'
import html from './index.html?toJs'
import css from './index.scss?toJs'
import define from '@utils/defineEle'

export default define('comp-page', {
  template: html,
  style: css,
  observedAttributes: ['style'],
  setup(_, { emits }) {
    emits('console')
    // const pageRootRef = refTemplate('comp-page-ref')
  },
  attributeChanged() {
    this.$defineRefs['comp-page-ref']?.setAttribute(
      'style',
      this.$props.style || ''
    )
  }
})

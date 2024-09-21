import html from './index.html?raw'
import css from './index.scss?raw'
import define from '@utils/defineEle'
// import refTemplate from '@utils/refTemplate'

export default define('v-home', {
  template: html,
  style: css,
  setup() {
    // const homeRef = refTemplate('home-ref')
  }
})

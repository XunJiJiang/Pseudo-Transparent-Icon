// import refTemplate from '@/utils/refTemplate'
import html from './index.html?raw'
import css from './index.scss?raw'
import define from '@utils/defineEle'
import effect from '@utils/effect'

export default define('l-index', {
  template: html,
  style: css,
  setup() {
    // const view = refTemplate('v-home-ref')
    effect(() => {
      setTimeout(() => {
        // console.log('l-index view', view)
      })
    })
  }
})

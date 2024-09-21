// import refTemplate from '@/utils/refTemplate'
import html from './index.html?toJs'
import css from './index.scss?toJs'
import define from '@utils/defineEle'
import effect from '@utils/effect'

export default define('layout-index', {
  template: html,
  style: css,
  setup() {
    // const view = refTemplate('view-home-1')
    effect(() => {
      setTimeout(() => {
        // console.log('layout-index view', view)
      })
    })
  }
})

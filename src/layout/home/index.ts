import html from './index.html?toJs'
import css from './index.scss?toJs'
import define from '@utils/defineEle'

export default define('layout-home', {
  template: html,
  style: css,
  setup() {}
})

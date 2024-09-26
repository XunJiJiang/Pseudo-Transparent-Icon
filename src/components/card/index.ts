import html from './index.html?raw'
import css from './index.scss?raw'
import { define } from 'xj-web-core/index'

export default define('c-card', {
  template: html,
  style: css,
  setup() {
    return {}
  }
})

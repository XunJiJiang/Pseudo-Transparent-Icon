import html from './index.html?raw'
import css from './index.scss?raw'
import { define } from 'xj-web-core/index'

export default define('v-home', {
  template: html,
  style: css,
  emit: {
    prev: {
      required: true
    }
  },
  props: {
    count: {
      required: true
    }
  },
  setup(props, { emit }) {
    // const homeRef = refTemplate('home-ref')
    return {
      handleClick() {
        emit('prev')
      }
    }
  }
})

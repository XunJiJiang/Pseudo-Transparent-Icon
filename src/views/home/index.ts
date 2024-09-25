import html from './index.html?raw'
import css from './index.scss?raw'
import { define } from 'xj-web-core/index'

export default define('v-home', {
  template: html,
  style: css,
  observedAttributes: ['data-style'],
  props: {
    style: {
      default: ''
    }
  },
  emit: {
    next: {
      required: true
    },
    scroll: {
      required: true
    }
  },
  setup({ style }, { emit, expose }) {
    // const homeRef = refTemplate('home-ref')
    expose({
      style: style,
      scroll(scrollTop: number) {
        emit('scroll', scrollTop)
      }
    })
    return {
      handleClick() {
        emit('next')
      }
    }
  },
  attributeChanged(name, _oldValue, newValue) {
    if (name === 'data-style')
      this.$defineRefs['c-page-ref']?.setAttribute('data-style', newValue)
  }
})

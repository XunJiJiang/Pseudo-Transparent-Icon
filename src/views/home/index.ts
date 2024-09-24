import html from './index.html?raw'
import css from './index.scss?raw'
import { define } from 'xj-web-core/index'

export default define('v-home', {
  template: html,
  style: css,
  observedAttributes: ['data-style', 'data-header-style'],
  props: {
    style: {
      default: ''
    }
  },
  emit: {
    next: {
      required: true
    }
  },
  setup({ style }, { emit, expose }) {
    // const homeRef = refTemplate('home-ref')
    expose({
      style: style
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
    else if (name === 'data-header-style')
      this.$defineRefs['c-page-ref']?.setAttribute(
        'data-header-style',
        newValue
      )
  }
})

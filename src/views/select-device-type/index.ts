import html from './index.html?raw'
import css from './index.scss?raw'
import { define } from 'xj-web-core/index'

export default define('v-sd-type', {
  template: html,
  style: css,
  observedAttributes: ['data-style', 'data-header-style'],
  props: {
    style: {
      default: ''
    }
  },
  emit: {
    prev: {
      required: true
    },
    next: {
      required: true
    }
  },
  setup({ style }, { emit, expose }) {
    expose({
      style: style
    })
    return {
      back() {
        emit('prev')
      },
      next() {
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

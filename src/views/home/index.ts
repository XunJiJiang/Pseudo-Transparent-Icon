import html from './index.html?raw'
import css from './index.scss?raw'
import { defineCustomElement } from 'xj-web-core/index'

type HomeProps = {
  style: string
  'data-status': string
}

type HomeEmit = {
  next: (index?: number, style?: string) => void
}

export default defineCustomElement('v-home', {
  template: html,
  style: css,
  observedAttributes: ['data-status'],
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
  setup({ style }: HomeProps, { emit }) {
    // const homeRef = refTemplate('home-ref')
    return {
      handleClick() {
        emit<HomeEmit>('next')
      },
      style: style
    }
  },
  attributeChanged(name, _oldValue, newValue) {
    if (name === 'data-status')
      this.$defineRefs['c-page-ref']?.setAttribute('data-status', newValue)
  }
})

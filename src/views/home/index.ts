import html from './index.html?raw'
import css from './index.scss?raw'
import { define } from 'xj-web-core/index'

type HomeProps = {
  style: string
  'data-style': string
}

type HomeEmit = {
  next: (index?: number, style?: string) => void
}

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
    }
  },
  setup({ style }: HomeProps, { emit }) {
    // const homeRef = refTemplate('home-ref')
    return {
      handleClick() {
        emit<HomeEmit>('next')
      },
      handleClick2() {
        emit<HomeEmit>('next', 4, 'absolute')
      },
      style: style
    }
  },
  attributeChanged(name, _oldValue, newValue) {
    if (name === 'data-style')
      this.$defineRefs['c-page-ref']?.setAttribute('data-style', newValue)
  }
})

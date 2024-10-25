import css from './index.scss?raw'
import { defineCustomElement } from 'xj-web-core/index'
import '@/assets/icon/iconfont.scss'

export default defineCustomElement('c-icon', {
  style: css,
  observedAttributes: ['size', 'name', 'style'],
  setup(props) {
    if (!props.name) {
      /*@__PURE__*/ console.error('c-icon name is required')
    }

    return (
      <i
        class={`iconfont icon-${props.name}`}
        style={`font-size: ${props.size}; ${props.style}`}
      ></i>
    )
  },
  connected() {}
})

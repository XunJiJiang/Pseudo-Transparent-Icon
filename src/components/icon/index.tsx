import './index.scss'
import { defineCustomElement } from 'xj-web-core/index'
import '@/assets/icon/iconfont.scss'

export default defineCustomElement('c-icon', {
  observedAttributes: ['size', 'name', 'style'],
  setup(props) {
    if (!props.name) {
      /*@__PURE__*/ console.error('c-icon name is required')
    }

    return (
      <i
        data-c-icon
        class={`iconfont icon-${props.name}`}
        style={`font-size: ${props.size}; ${props.style}`}
      />
    )
  },
  connected() {}
})

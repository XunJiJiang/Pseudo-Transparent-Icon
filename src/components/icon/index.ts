import css from './index.scss?raw'
import {
  getInstance,
  defineCustomElement,
  effect /* refTemplate */
} from 'xj-web-core/index'
import '@/assets/icon/iconfont.scss'

export default defineCustomElement('c-icon', {
  style: css,
  observedAttributes: ['size', 'name', 'style'],
  setup(props) {
    if (!props.name) {
      /*@__PURE__*/ console.error('c-icon name is required')
    }
    effect(() => {
      const { $root } = getInstance()
      const iconRoot = document.createElement('i')
      iconRoot.className = `iconfont icon-${props.name}`
      if (props.size) iconRoot.style.fontSize = `${props.size}`
      if (props.style) iconRoot.style.cssText += props.style
      $root?.appendChild(iconRoot)
    })
  },
  connected() {}
})

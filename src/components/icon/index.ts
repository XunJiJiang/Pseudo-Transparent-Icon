import css from './index.scss?raw'
import {
  getInstance,
  define,
  effect /* refTemplate */
} from 'xj-web-core/index'
import '@/assets/icon/iconfont.css'

export default define('c-icon', {
  style: css,
  observedAttributes: ['size', 'name', 'style'],
  setup(props) {
    if (!props.name) {
      /*@__PURE__*/ console.error('c-icon name is required')
    }
    effect(() => {
      const { $shadowRoot } = getInstance()
      const iconRoot = document.createElement('i')
      iconRoot.className = `iconfont icon-${props.name}`
      if (props.size) iconRoot.style.fontSize = `${props.size}px`
      if (props.style) iconRoot.style.cssText += props.style
      $shadowRoot.appendChild(iconRoot)
    })
  },
  connected() {}
})

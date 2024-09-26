import html from './index.html?raw'
import css from './index.scss?raw'
import { define, getInstance, onMounted } from 'xj-web-core/index'

export default define('c-button', {
  template: html,
  style: css,
  emit: {
    click: {
      default: () => {}
    }
  },
  observedAttributes: ['style', 'data-type'],
  setup({ style, ...props }, { emit }) {
    onMounted(() => {
      const { $defineRefs } = getInstance()
      const button = $defineRefs['c-button-ref']
      button?.setAttribute(
        'data-type',
        (props['data-type'] as string) ?? 'default'
      )

      if (style) button?.setAttribute('style', style as string)

      const touchstart = () => {
        button?.classList.add('touch-active')
      }
      const touchend = () => {
        button?.classList.remove('touch-active')
      }

      button?.addEventListener('click', touchstart)
      window.addEventListener('touchend', touchend)

      return () => {
        button?.removeEventListener('click', touchstart)
        window.removeEventListener('touchend', touchend)
      }
    })

    return {
      handleClick(e: Event) {
        emit('click', e)
      }
    }
  }
})

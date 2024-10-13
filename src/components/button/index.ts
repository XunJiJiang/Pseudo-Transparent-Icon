import html from './index.html?raw'
import css from './index.scss?raw'
import {
  define,
  getInstance,
  onMounted,
  ref,
  refTemplate
} from 'xj-web-core/index'

export type CButtonExpose = {
  setStatus: (status: 'disabled' | 'normal') => void
}

export type CButtonProps = {
  style: string
  'data-type': string
  'aria-label': string
}

export default define('c-button', {
  template: html,
  style: css,
  observedAttributes: ['style', 'data-type', 'aria-label'],
  emit: {
    click: {
      default: () => {}
    }
  },
  setup(
    { style, 'data-type': dataType, 'aria-label': ariaLabel }: CButtonProps,
    { emit, expose }
  ) {
    const buttonRef = refTemplate('c-button-ref')
    onMounted(() => {
      const { $defineRefs } = getInstance()
      const button = $defineRefs['c-button-ref']
      button?.setAttribute('data-type', (dataType as string) ?? 'default')

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

    const status = ref('normal')

    expose({
      setStatus(_status: 'disabled' | 'normal') {
        const button = buttonRef.value
        if (!button) return
        status.value = _status
        if (_status === 'disabled') {
          button.classList.add('disabled')
        } else {
          button.classList.remove('disabled')
        }
      }
    })

    return {
      handleClick(e: Event) {
        if (status.value === 'disabled') return
        emit('click', e)
      },
      ariaLabel
    }
  }
})

import css from './index.scss?raw'
import { defineCustomElement, onMounted, ref } from 'xj-web-core/index'

export type CButtonExpose = {
  setStatus: (status: 'disabled' | 'normal') => void
}

export type CButtonProps = {
  style: string
  'data-type': string
  'aria-label': string
}

export default defineCustomElement('c-button', {
  style: css,
  observedAttributes: ['style', 'data-type', 'aria-label'],
  emit: {
    click: {
      default: (e: Event): void => {
        console.warn('c-button: 未设置点击事件', e)
      },
      required: true
    }
  },
  setup(
    { style, 'data-type': dataType, 'aria-label': ariaLabel },
    { emit, expose }
  ) {
    const buttonRef = ref<HTMLButtonElement>(null)
    onMounted(() => {
      const button = buttonRef.value

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

    return (
      <button
        ref={buttonRef}
        class="c-button"
        aria-label={ariaLabel}
        data-type={dataType}
        style={style}
        on-click={(e: Event) => {
          if (status.value === 'disabled') return
          emit('click', e)
        }}
      >
        <slot name="default" />
      </button>
    )
  }
})

import './index.scss'
import {
  defineCustomElement,
  isRef,
  onMounted,
  ref,
  watch,
  type Ref
} from 'xj-fv'

export type CButtonExpose = {
  setStatus: (status: 'disabled' | 'normal') => void
}

export type CButtonProps = {
  style: string
  'data-type': string
  'aria-label': string
}

export default defineCustomElement({
  name: 'c-button',
  observedAttributes: ['style', 'data-type', 'aria-label'],
  props: {
    disabled: {
      type: Boolean as () => boolean | Ref<boolean>,
      default: false
    }
  },
  emits: {
    click: {
      required: true,
      type: Function as unknown as () => (e: Event) => void
    }
  },
  slots: ['default'],
  setup(
    { style, disabled, 'data-type': dataType, 'aria-label': ariaLabel },
    { emit, slot }
  ) {
    const buttonRef = ref<HTMLButtonElement>(null)
    onMounted(() => {
      const button = buttonRef.value

      if ((isRef(disabled) && disabled.value === true) || disabled === true) {
        button?.setAttribute('disabled', 'true')
      }

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

    const setStatus = (_status: 'disabled' | 'normal') => {
      const button = buttonRef.value
      if (!button) return
      status.value = _status
      if (_status === 'disabled') {
        button.setAttribute('disabled', 'true')
        button.classList.add('disabled')
      } else {
        button.removeAttribute('disabled')
        button.classList.remove('disabled')
      }
    }

    if (isRef(disabled))
      watch(disabled, (val) => {
        setStatus(val ? 'disabled' : 'normal')
      })

    return (
      <button
        data-c-button
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
        {slot.default()}
      </button>
    )
  }
})

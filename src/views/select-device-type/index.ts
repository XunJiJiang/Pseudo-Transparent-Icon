import { type CButtonExpose } from '@components/button'
import html from './index.html?raw'
import css from './index.scss?raw'
import {
  define,
  effect,
  reactive,
  ref,
  exposeTemplate
} from 'xj-web-core/index'

type SelectDeviceTypeProps = {
  'data-status': string
  style: string
}

type SelectDeviceTypeEmit = {
  prev: () => void
  next: () => void
  scroll: (scrollTop: number) => void
  change: (
    index: number,
    value: {
      label: string
      value: string
    }
  ) => void
}

export default define('v-sd-type', {
  template: html,
  style: css,
  observedAttributes: ['data-status'],
  props: {
    style: {
      default: ''
    }
  },
  emit: {
    prev: {
      required: true
    },
    next: {
      required: true
    },
    scroll: {
      required: true
    },
    change: {
      required: true
    }
  },
  setup({ style }: SelectDeviceTypeProps, { emit }) {
    const devices = reactive([
      {
        label: 'iphone 12 - 15',
        value: 'iphone-12-15'
      },
      {
        label: 'iphone 12 - 15 plus',
        value: 'iphone-12-15-plus'
      },
      {
        label: 'iphone 12 - 15 pro',
        value: 'iphone-12-15-pro'
      },
      {
        label: 'iphone 12 - 15 pro max',
        value: 'iphone-12-15-pro-max'
      },
      {
        label: 'iphone 16',
        value: 'iphone-16'
      },
      {
        label: 'iphone 16 plus',
        value: 'iphone-16-plus'
      },
      {
        label: 'iphone 16 pro',
        value: 'iphone-16-pro'
      },
      {
        label: 'iphone 16 pro max',
        value: 'iphone-16-pro-max'
      },
      {
        label: 'ipad pro 12.9',
        value: 'ipad-pro-12.9'
      },
      {
        label: 'ipad pro 11',
        value: 'ipad-pro-11'
      },
      {
        label: 'ipad air',
        value: 'ipad-air'
      },
      {
        label: 'ipad',
        value: 'ipad'
      },
      {
        label: 'ipad mini',
        value: 'ipad-mini'
      }
    ])
    const butExpose = exposeTemplate<CButtonExpose>('c-button-expose')
    const nowDevice = ref<{
      index: number
      val: {
        label: string
        value: string
      }
    } | null>(null)
    effect(() => {
      if (!nowDevice.value) {
        butExpose.value?.setStatus('disabled')
        return
      }
      butExpose.value?.setStatus('normal')
      const { index, val } = nowDevice.value
      emit<SelectDeviceTypeEmit>('change', index, val)
    })
    return {
      back() {
        emit<SelectDeviceTypeEmit>('prev')
      },
      next() {
        emit<SelectDeviceTypeEmit>('next')
      },
      style: style,
      scroll(scrollTop: number) {
        emit<SelectDeviceTypeEmit>('scroll', scrollTop)
      },
      devices,
      setDevice(
        index: number,
        val: {
          label: string
          value: string
        }
      ) {
        nowDevice.value = {
          index,
          val
        }
      },
      nowDevice
    }
  },
  attributeChanged(name, _oldValue, newValue, data) {
    if (name === 'data-status') {
      this.$defineRefs['c-page-ref']?.setAttribute('data-status', newValue)
      if (newValue.includes('enter')) {
        data.nowDevice.value = null
      }
    }
  }
})

import html from './index.html?raw'
import css from './index.scss?raw'
import { define, reactive } from 'xj-web-core/index'

type SelectDeviceTypeProps = {
  'data-style': string
  style: string
}

type SelectDeviceTypeEmit = {
  prev: () => void
  next: () => void
  scroll: (scrollTop: number) => void
}

export default define('v-sd-type', {
  template: html,
  style: css,
  observedAttributes: ['data-style'],
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
    }
  },
  setup({ style }: SelectDeviceTypeProps, { emit, expose }) {
    const devices = reactive([
      {
        label: '设备1',
        value: 'type1'
      },
      {
        label: '设备2',
        value: 'type2'
      },
      {
        label: '设备3',
        value: 'type3'
      },
      {
        label: '设备4',
        value: 'type4'
      }
    ])
    expose({})
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
      devices
    }
  },
  attributeChanged(name, _oldValue, newValue) {
    if (name === 'data-style')
      this.$defineRefs['c-page-ref']?.setAttribute('data-style', newValue)
  }
})

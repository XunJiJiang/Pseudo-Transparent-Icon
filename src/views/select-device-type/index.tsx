import { type CButtonExpose } from '@components/button'
import './index.scss'
import {
  defineCustomElement,
  effect,
  reactive,
  ref,
  type BaseElement
} from 'xj-fv'

export type SelectDeviceTypeProps = {
  'data-status': string
  style: string
}

export type SelectDeviceTypeEmit = {
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

export default defineCustomElement('v-sd-type', {
  observedAttributes: ['data-status'],
  props: {
    style: {
      default: '',
      type: String
    }
  },
  emits: {
    next: {
      required: true,
      type: Function as unknown as () => (
        index?: number,
        style?: string
      ) => void
    },
    scroll: {
      required: true,
      type: Function as unknown as () => (scrollTop: number) => void
    },
    change: {
      required: true,
      type: Function as unknown as () => (
        index: number,
        value: {
          label: string
          value: string
        }
      ) => void
    }
  },
  setup({ style }, { emit, share }) {
    const cPageRef = ref<BaseElement>(null)

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
    const butExpose = ref<CButtonExpose>(null)
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
      emit('change', index, val)
    })

    share({
      nowDevice,
      cPageRef
    })

    return (
      <c-page
        ref={cPageRef}
        data-index="1"
        on-scroll={(scrollTop: number) => {
          emit('scroll', scrollTop)
        }}
        style={style}
      >
        <div data-v-sd-type slot="default" class="root">
          <c-card>
            <div slot="default" class="card-content">
              <div class="header-icon">
                <span>
                  <c-icon name="mobile" size="3.6rem" />
                </span>
                <span>
                  <c-icon name="tablet" size="3.6rem" />
                </span>
              </div>
              <div class="content">
                <h4>选择您的设备</h4>
                <p>
                  如果选择支持旋转的设备，建议选择最常用的旋转方向。因为创建的图标并不能同时支持横向和纵向的对齐。
                </p>
                <p>
                  <a
                    href="https://github.com/XunJiJiang/Pseudo-Transparent-Icon?tab=readme-ov-file#创建的图标在旋转后无法对齐"
                    target="_blank"
                  >
                    <c-icon name="github-fill" size="0.8rem" />
                    &nbsp; 为什么会这样?
                  </a>
                </p>
              </div>
            </div>
          </c-card>
          <c-button-group
            title="选择您的设备"
            content={devices}
            type="radio"
            on-change={(
              index: number,
              val: {
                label: string
                value: string
              }
            ) => {
              nowDevice.value = {
                index,
                val
              }
            }}
          />
          <c-button
            expose={butExpose}
            on-click={() => {
              emit('next')
            }}
            data-type="default"
            aria-label="完成设备选择"
          >
            <span slot="default">确认</span>
          </c-button>
        </div>
      </c-page>
    )
  },
  attributeChanged({ name, newValue }, { data }) {
    if (name === 'data-status') {
      data.cPageRef.value?.setAttribute('data-status', newValue)
      if (newValue.includes('enter')) {
        data.nowDevice.value = null
      }
    }
  }
})

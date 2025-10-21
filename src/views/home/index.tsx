import './index.scss'
import Page from '@components/page'
import { defineCustomElement, ref, type BaseElement } from 'xj-fv'
import Icon from '@/components/icon'
import Button from '@/components/button'
import Card from '@/components/card'

export type HomeProps = {
  style: string
  'data-status': string
}

export type HomeEmit = {
  next: (index?: number, style?: string) => void
}

export default defineCustomElement({
  name: 'v-home',
  observedAttributes: ['data-status', 'd-test'],
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
        style?: 'relative' | 'absolute'
      ) => void
    },
    scroll: {
      required: true,
      type: Function as unknown as () => (scrollTop: number) => void
    }
  },
  setup({ style }, { emit, share }) {
    const cPageRef = ref<BaseElement>(null)
    share({ cPageRef })

    return (
      <Page
        ref={cPageRef}
        data-index="1"
        on-scroll={(scrollTop: number) => {
          emit('scroll', scrollTop)
        }}
        style={style}
      >
        <div data-v-home slot="default" class="root">
          <Card>
            <div slot="default" class="card">
              <div class="header-icon">
                <span>
                  <Icon name="radius-upleft" size="1.6rem" />
                </span>
                <span>
                  <Icon name="radius-setting" size="1.6rem" />
                </span>
                <span>
                  <Icon name="radius-bottomleft" size="1.6rem" />
                </span>
                <span>
                  <Icon name="radius-bottomright" size="1.6rem" />
                </span>
              </div>
              <div class="content">
                <h1>快速创建伪透明图标</h1>
                <p>
                  使用xj-web构建的快速伪透明图标生成，创建美妙绝伦无与伦比完美无缺喵喵喵喵的比较完美壁纸。
                </p>
                <p>
                  <a
                    href="https://github.com/XunJiJiang/Pseudo-Transparent-Icon"
                    target="_blank"
                  >
                    <Icon name="github-fill" size="0.8rem" />
                    &nbsp;进一步了解伪透明图标和xj-web...
                  </a>
                </p>
              </div>
            </div>
          </Card>
          <Button
            on-click={() => {
              emit('next')
            }}
            data-type="default"
            aria-label="开始"
          >
            <span slot="default">现在开始</span>
          </Button>
        </div>
      </Page>
    )
  },
  attributeChanged({ name, newValue }, { data }) {
    if (name === 'data-status')
      data.cPageRef.value?.setAttribute('data-status', newValue)
  }
})

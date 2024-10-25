import css from './index.scss?raw'
import { defineCustomElement } from 'xj-web-core/index'

type HomeProps = {
  style: string
  'data-status': string
}

type HomeEmit = {
  next: (index?: number, style?: string) => void
}

export default defineCustomElement('v-home', {
  style: css,
  observedAttributes: ['data-status'],
  props: {
    style: {
      default: ''
    }
  },
  emit: {
    next: {
      required: true
    }
  },
  setup({ style }: HomeProps, { emit }) {
    // const homeRef = refTemplate('home-ref')

    return (
      <c-page ref="c-page-ref" data-index="0" on-scroll="scroll" style={style}>
        <div slot="default" class="root">
          <c-card>
            <div slot="default" class="card">
              <div class="header-icon">
                <span>
                  <c-icon name="radius-upleft" size="1.6rem"></c-icon>
                </span>
                <span>
                  <c-icon name="radius-setting" size="1.6rem"></c-icon>
                </span>
                <span>
                  <c-icon name="radius-bottomleft" size="1.6rem"></c-icon>
                </span>
                <span>
                  <c-icon name="radius-bottomright" size="1.6rem"></c-icon>
                </span>
              </div>
              <div class="content">
                <h1>快速创建伪透明图标</h1>
                <p>
                  使用xj-web构建的快速伪透明图标生成，创建美妙绝伦无与伦比完美无缺喵喵喵喵的完美壁纸。
                </p>
                <p>
                  <a
                    href="https://github.com/XunJiJiang/Pseudo-Transparent-Icon"
                    target="_blank"
                  >
                    <c-icon name="github-fill" size="0.8rem"></c-icon>
                    &nbsp; 进一步了解伪透明图标和xj-web...
                  </a>
                </p>
              </div>
            </div>
          </c-card>
          <c-button
            on-click={() => {
              emit<HomeEmit>('next')
            }}
            data-type="default"
            aria-label="开始"
          >
            <span slot="default">现在开始</span>
          </c-button>
        </div>
      </c-page>
    )
  },
  attributeChanged({ name, newValue }) {
    if (name === 'data-status')
      this.$defineRefs['c-page-ref']?.setAttribute('data-status', newValue)
  }
})

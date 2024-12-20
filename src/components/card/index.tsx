import css from './index.scss?raw'
import { defineCustomElement } from 'xj-web-core/index'

export type CardProps = {
  title?: string
  footer?: string
  'no-padding'?: boolean
}

export default defineCustomElement('c-card', {
  props: {
    title: {
      default: ''
    },
    footer: {
      default: ''
    },
    'no-padding': {
      default: false
    }
  },
  style: css,
  setup({ title, footer, 'no-padding': noPadding }) {
    return (
      <>
        {title ? <header class="header">{title}</header> : ''}
        <div
          class={`card${footer ? ' has-footer' : ''}${noPadding ? ' no-padding' : ''}`}
        >
          <slot name="default">
            <div class="default">
              <div class="header-icon">
                <span>
                  <c-icon name="radius-upleft" size="1.6rem" />
                </span>
                <span>
                  <c-icon name="radius-setting" size="1.6rem" />
                </span>
                <span>
                  <c-icon name="radius-bottomleft" size="1.6rem" />
                </span>
                <span>
                  <c-icon name="radius-bottomright" size="1.6rem" />
                </span>
              </div>
              <div class="content">
                <p>
                  <a
                    href="https://github.com/XunJiJiang/Pseudo-Transparent-Icon"
                    target="_blank"
                  >
                    <c-icon name="github-fill" size="0.8rem" />
                    &nbsp; 进一步了解伪透明图标和xj-web...
                  </a>
                </p>
              </div>
            </div>
          </slot>
        </div>
        {footer ? <footer class="footer">{footer}</footer> : ''}
      </>
    )
  }
})

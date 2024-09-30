import css from './index.scss?raw'
import { define } from 'xj-web-core/index'

type CardProps = {
  title?: string
  footer?: string
  'no-padding'?: boolean
}

export default define('c-card', {
  template: ({ title, footer, 'no-padding': noPadding }: CardProps) => {
    return `
      ${title ? `<header class="header">${title}</header>` : ''}
      <div class="card${footer ? ' has-footer' : ''}${noPadding ? ' no-padding' : ''}">
        <slot name="default">
          <div class="default">
            <div class="header-icon">
              <span><c-icon name="radius-upleft" size="1.6rem"></c-icon></span>
              <span><c-icon name="radius-setting" size="1.6rem"></c-icon></span>
              <span><c-icon name="radius-bottomleft" size="1.6rem"></c-icon></span>
              <span><c-icon name="radius-bottomright" size="1.6rem"></c-icon></span>
            </div>
            <div class="content">
              <p>
                <a
                  href="https://github.com/XunJiJiang/Pseudo-Transparent-Icon"
                  target="_blank"
                >
                  <c-icon name="github-fill" size="0.8rem"></c-icon>
                  进一步了解伪透明图标和xj-web-core...
                </a>
              </p>
            </div>
          </div>
        </slot>
      </div>
      ${footer ? `<footer class="footer">${footer}</footer>` : ''}
    `
  },
  props: {
    title: {
      default: null
    },
    footer: {
      default: null
    },
    'no-padding': {
      default: false
    }
  },
  style: css,
  setup() {
    return {}
  }
})

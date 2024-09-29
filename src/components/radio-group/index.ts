import css from './index.scss?raw'
import { define, effect } from 'xj-web-core/index'

type RadioGroupProps = {
  title?: string
  content: {
    label: string
    value: string
  }[]
}

type RadioGroupEmit = {
  change: (value: string) => void
}

export default define('c-radio-group', {
  template: ({ title, content }: RadioGroupProps) => {
    console.log(content)
    return `
      <c-card>
        <div slot="default" class="radio-group">
          ${title ? `<header>${title}</header>` : ''}
          <div class="radio-group-content">
            ${content.map((item) => `<div class="radio-item">${item.label}</div>`).join('')}
          </div>
        </div>
      </c-card>
    `
  },
  style: css,
  emit: {
    change: {
      default: () => {}
    }
  },
  props: {
    title: {
      default: null
    },
    content: {
      required: true
    }
  },
  setup({ title, content }: RadioGroupProps, { emit }) {
    effect(() => {
      console.log('content changed', content[0])
    })
    return {
      change() {}
    }
  }
})

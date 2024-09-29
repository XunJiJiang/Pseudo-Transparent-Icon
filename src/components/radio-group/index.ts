import css from './index.scss?raw'
import { define } from 'xj-web-core/index'

type RadioGroupProps = {
  title?: string
  content: {
    label: string
    value: string
  }[]
}

type RadioGroupEmit = {
  change: (
    index: number,
    value: {
      label: string
      value: string
    }
  ) => void
}

export default define('c-radio-group', {
  template: ({ title, content }: RadioGroupProps) => {
    return `
      <c-card>
        <div slot="default" class="radio-group">
          ${title ? `<header>${title}</header>` : ''}
          <div class="radio-group-content">
            ${content.map((item, i) => `<div class="radio-item" on-click="change, ${i}">${item.label}</div>`).join('')}
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
  setup({ content }: RadioGroupProps, { emit }) {
    // effect(() => {
    //   console.log('content changed', content[0])
    // })
    return {
      change(_e: Event, i: string) {
        emit<RadioGroupEmit>('change', Number(i), content[Number(i)])
      }
    }
  }
})

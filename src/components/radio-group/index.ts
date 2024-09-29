import css from './index.scss?raw'
import { define, effect } from 'xj-web-core/index'

type RadioGroupProps = {
  title: string
  content: {
    label: string
    value: string
  }[]
}

export default define('c-radio-group', {
  template: ({ content }: RadioGroupProps) => {
    console.log(content)
    return `<c-card></c-card>`
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
  setup({ content }: RadioGroupProps) {
    effect(() => {
      console.log('content changed', content[0])
    })
    return {}
  }
})

import css from './index.scss?raw'
import { defineCustomElement, refTemplate, useId } from 'xj-web-core/index'

type ButtonGroupProps = {
  type: 'radio' | 'checkbox' | 'independent'
  title?: string
  content: {
    label: string
    value: string
    style?: string
    // 以下为单个按钮的类型，仅在 type 为 independent 时生效
    butType?: 'switch' | 'button'
    click?: () => void
  }[]
}

type ButtonGroupEmit = {
  change: (
    index: number,
    value: {
      label: string
      value: string
    }
  ) => void
}

const createItem = (
  type: string,
  id: string,
  name: string,
  value: string,
  opt: {
    event: (e: Event) => void
    style?: string
  }
) => {
  return (
    <label ref={id} for={id} class="button-item" style={opt.style}>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        style="display: none"
        class={`button-item-${type}`}
        on-change={opt.event}
      />
      <span class="button-item-inner">
        <span class="button-item-label">{value}</span>
        <span class="button-item-icon">
          <c-icon name="check" size="1rem"></c-icon>
        </span>
      </span>
    </label>
  )
}

type TypeMap = {
  [key in 'radio' | 'checkbox' | 'independent']: (
    id: string,
    name: string,
    value: string,
    opt: {
      event: (e: Event) => void
      style?: string
    }
  ) => string
}

const typeMap: TypeMap = {
  radio(id, name, value, opt) {
    return createItem('radio', id, name, value, opt)
  },
  checkbox(id, name, value, opt) {
    console.warn('button-group: 类型 checkbox 没有经过验证')
    return createItem('checkbox', id, name, value, opt)
  },
  independent(id, _name, value, opt) {
    console.warn('button-group: 类型 independent 没有经过验证')
    return (
      <button ref={id} id={id} class="button-item" style={opt.style}>
        {value}
      </button>
    )
  }
}

export default defineCustomElement('c-button-group', {
  style: css,
  emit: {
    change: {
      required: true
    }
  },
  props: {
    title: {
      default: null
    },
    content: {
      required: true
    },
    type: {
      default: 'independent'
    }
  },
  setup({ content, type, title }: ButtonGroupProps, { emit }) {
    const id = useId()
    const butRefs = content.map((_, i) =>
      refTemplate('button-group::' + i + id)
    )
    let prevIndex = -1

    const change = (_e: Event, i: string) => {
      const butRef = butRefs[Number(i)]
      if (!butRef.value) return
      emit<ButtonGroupEmit>('change', Number(i), content[Number(i)])
      if (type === 'radio') {
        butRefs[prevIndex]?.value?.classList.remove('checked')
        butRef.value.classList.add('checked')
        prevIndex = Number(i)
      } else if (type === 'checkbox') {
        butRef.value.classList.toggle('checked')
      }
    }

    return (
      <c-card
        no-padding="true"
        footer="如果你能看到这个那就是我忘了删了。"
        title={title}
      >
        <div slot="default" class="button-group">
          <div class="button-group-content">
            {content.map(({ label, style }, i) =>
              typeMap[type](
                'button-group::' + i + id,
                'button-group' + id,
                label,
                {
                  event: (event: Event) => change(event, i.toString()),
                  style
                }
              )
            )}
          </div>
        </div>
      </c-card>
    )
  }
})

import { Func } from '@type/function'
import BaseElement from './BaseElement'
import reactive from './reactive'
import { setComponentIns, getParentComponent } from './fixComponentIns'
import { exposeMethods } from './exposeMethods'

type EleCallback = (
  this: BaseElement,
  data: Record<string, unknown>,
  context: {
    methods: (key: string, ...args: unknown[]) => unknown
  }
) => void

const define = (
  name: string,
  {
    template,
    style,
    setup,
    data,
    methods,
    observedAttributes,
    connected,
    disconnected,
    adopted,
    attributeChanged
    // ...rest
  }: {
    template?: string
    style?: string
    setup?: (
      props: Record<string, string | null>,
      context: {
        expose: (methods: Record<string, Func>) => void
        emits: (key: string, ...args: unknown[]) => unknown
      }
    ) => Record<string, unknown> | void
    // TODO: data的类型声明存在
    data?: () => Record<string, unknown>
    methods?: Record<string, (this: BaseElement, ...args: unknown[]) => void>
    observedAttributes?: string[]
    connected?: EleCallback
    disconnected?: EleCallback
    adopted?: EleCallback
    attributeChanged?: (
      this: BaseElement,
      name: string,
      oldValue: string,
      newValue: string,
      data: Record<string, unknown>,
      context: {
        methods: (key: string, ...args: unknown[]) => unknown
      }
    ) => void
  },
  options?: ElementDefinitionOptions
) => {
  class Ele extends BaseElement {
    constructor() {
      super()
      setComponentIns(this)
      this.data = reactive(data?.() || {})
      this.$methods = methods || {}

      // 获取属性
      for (const attr of observedAttributes ?? []) {
        if (this.hasAttribute(attr)) {
          this.props[attr] = this.getAttribute(attr)
        }
      }

      const shadow = this.shadowRoot

      const parentComponent = getParentComponent()
      const emits = (key: string, ...args: unknown[]): unknown => {
        if (parentComponent) {
          if (key in parentComponent.$exposeMethods) {
            return parentComponent.$exposeMethods[key](...args)
          }
          /*@__PURE__*/ console.error(
            `${parentComponent.localName} 未定义 ${key} 方法。`
          )
        } else {
          /*@__PURE__*/ console.warn(`${this.localName} 没有父组件。`)
        }
      }

      const setupData =
        setup?.(this.props, {
          expose: exposeMethods,
          emits
        }) || {}

      for (const key in setupData) {
        const val = setupData[key]
        if (typeof val === 'function') {
          this.$methods[key] = val as Func
        } else {
          this.data[key] = val
        }
      }

      this.methods = (key, ...args) => {
        if (key in this.$methods) {
          return this.$methods[key](...args)
        }
        /*@__PURE__*/ console.error(`${this.localName} 未定义 ${key} 方法。`)
      }

      // 创建模板
      shadow.innerHTML = template || ''

      // 创建 style 标签
      if (style) {
        const styleEle = document.createElement('style')
        styleEle.textContent = style
        shadow.appendChild(styleEle)
      }

      // 获取定义了ref属性的元素
      const refs = Array.from(shadow.querySelectorAll('[ref]'))
      refs.forEach((ele: Element) => {
        const refName = ele.getAttribute('ref')
        if (!refName) return
        this.$defineRefs[refName] = ele
        if (refName in this.$refs) {
          this.$refs[refName].value = ele
        }
      })

      // 获取全部请求绑定事件的元素
      const elements = BaseElement.events.reduce(
        (acc, event) => {
          acc[event] = Array.from(shadow.querySelectorAll(`[on-${event}]`))
          return acc
        },
        {} as Record<(typeof BaseElement.events)[number], HTMLElement[]>
      )

      // 绑定事件
      for (const event in elements) {
        elements[event].forEach((ele: HTMLElement) => {
          const target = ele
          const fnName = target.getAttribute(`on-${event}`)
          if (!fnName) return
          const fn =
            this.$methods[fnName as keyof typeof this.$methods].bind(this)
          if (!fn)
            return /*@__PURE__*/ console.error(
              `${this.localName} 未定义 ${fnName} 方法。`
            )
          ele.addEventListener(event, (e) => {
            fn(e)
          })
        })
      }
      setComponentIns(null)
    }

    static get observedAttributes() {
      return observedAttributes || []
    }

    connectedCallback() {
      connected?.call(this, this.data, { methods: this.methods })
    }

    disconnectedCallback() {
      disconnected?.call(this, this.data, { methods: this.methods })
    }

    adoptedCallback() {
      adopted?.call(this, this.data, { methods: this.methods })
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
      attributeChanged?.call(this, name, oldValue, newValue, this.data, {
        methods: this.methods
      })
    }
  }

  return () => customElements.define(name, Ele, options)
}

export default define

/*
 * WARN: 可能存在的问题:
 * 1. 在定义的方法或effect中创建超出一层的自定义组件时,
 *    可能无法获取正确的父组件实例,
 *    而是会获取的最外层的自定义组件实例。
 *    因此最好不要在定义的方法或effect中创建超出一层的自定义组件。
 */

import { Func } from '@type/function'
import BaseElement from './BaseElement'
import reactive from './reactive'
import { setComponentIns, getCurrentComponent } from './fixComponentIns'
import { exposeAttributes } from './exposeAttributes'

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
      // 保存父组件实例
      const parentComponent = getCurrentComponent()
      // 设置当前组件实例
      setComponentIns(this)
      this.$data = reactive(data?.() || {})
      this.$methods = methods || {}

      // 获取监视的属性
      for (const attr of observedAttributes ?? []) {
        if (this.hasAttribute(attr)) {
          this.$props[attr] = this.getAttribute(attr)
        }
      }

      const shadow = this.$shadowRoot

      // 包装父组件暴露的方法
      const emits = (key: string, ...args: unknown[]): unknown => {
        if (parentComponent) {
          if (
            key in parentComponent.$exposeAttributes &&
            typeof parentComponent.$exposeAttributes[key] === 'function'
          ) {
            return parentComponent.$exposeAttributes[key](...args)
          }
          /*@__PURE__*/ console.error(
            `${parentComponent.localName} 未定义 ${key} 方法。`
          )
        } else {
          /*@__PURE__*/ console.warn(`${this.localName} 没有父组件。`)
        }
      }

      // 获取setup中的数据
      const setupData =
        setup?.(this.$props, {
          expose: exposeAttributes,
          emits
        }) || {}

      // 将setup中的数据分别放入data和$methods中
      for (const key in setupData) {
        const val = setupData[key]
        if (typeof val === 'function') {
          this.$methods[key] = val as Func
        } else {
          this.$data[key] = val
        }
      }

      // 将$methods中的方法封装一层, 使其在调用内部创建的自定义组件可以获取正确的父组件实例
      for (const key in this.$methods) {
        const fn = this.$methods[key].bind(this)
        this.$methods[key] = (...args: unknown[]) => {
          const parentComponent = getCurrentComponent()
          setComponentIns(this)
          const _return = fn(...args)
          setComponentIns(parentComponent)
          return _return
        }
      }

      // 将$methods中的方法绑定到methods上
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

      // 恢复父组件实例
      setComponentIns(parentComponent)
    }

    static get observedAttributes() {
      return observedAttributes || []
    }

    connectedCallback() {
      connected?.call(this, this.$data, { methods: this.methods })
    }

    disconnectedCallback() {
      disconnected?.call(this, this.$data, { methods: this.methods })
    }

    adoptedCallback() {
      adopted?.call(this, this.$data, { methods: this.methods })
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
      this.$props[name] = newValue
      attributeChanged?.call(this, name, oldValue, newValue, this.$data, {
        methods: this.methods
      })
    }
  }

  return () => customElements.define(name, Ele, options)
}

export default define

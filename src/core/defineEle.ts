/*
 * WARN: 可能存在的问题:
 * 1. 在单个自定义组件内创建出超出一层的自定义组件时,
 *    子组件只能获取到最外层的父组件实例, 无法获取到中间的父组件实例
 *    就这样挺好, 不需要关心中间的组件实例
 */

import { Func } from '@type/function'
import BaseElement, { type EventHandlers } from './BaseElement'
import reactive from './reactive'
import { setComponentIns } from './fixComponentIns'
import { exposeAttributes } from './exposeAttributes'
import { setRunningSetup } from './hooks/lifecycle/verifySetup'
import {
  clearBeforeCreate,
  runBeforeCreate
} from './hooks/lifecycle/beforeCreate'
import { clearCreated, runCreated } from './hooks/lifecycle/created'
import { clearBeforeMount, runBeforeMount } from './hooks/lifecycle/beforeMount'
import { clearMounted, runMounted } from './hooks/lifecycle/mounted'
import { runUnmounted } from './hooks/lifecycle/unmounted'

interface EleCallback {
  (
    this: BaseElement,
    data: Record<string, unknown>,
    context: {
      methods: Record<string, Func>
    }
  ): void
}

interface EleAttributeChangedCallback {
  (
    this: BaseElement,
    name: string,
    oldValue: string,
    newValue: string,
    data: Record<string, unknown>,
    context: {
      methods: Record<string, Func>
    }
  ): void
}

type DefaultOptions<T = unknown> = {
  [key: string]: {
    default?: T extends Func ? Func : unknown
    required?: boolean
  }
}

const checkPropsEmit = /*@__PURE__*/ <T>(
  opts: DefaultOptions<T>,
  ele: BaseElement
) => {
  for (const key in opts) {
    if (!opts[key].required && !('default' in opts[key])) {
      /*@__PURE__*/ console.error(
        `${ele.localName}: emit: ${key} 为非必须属性, 但未设置默认值。`
      )
    }
  }
}

const define = (
  name: string,
  {
    template,
    style,
    setup,
    props,
    emit,
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
      props: Record<string, unknown>,
      context: {
        expose: (methods: Record<string, unknown>) => void
        emit: (key: string, ...args: unknown[]) => unknown
      }
    ) => Record<string, unknown> | void
    props?: DefaultOptions
    emit?: DefaultOptions<Func>
    // TODO: data的类型声明存在
    data?: () => Record<string, unknown>
    methods?: Record<string, (this: BaseElement, ...args: unknown[]) => void>
    observedAttributes?: string[]
    connected?: EleCallback
    disconnected?: EleCallback
    adopted?: EleCallback
    attributeChanged?: EleAttributeChangedCallback
  },
  options?: ElementDefinitionOptions
) => {
  class Ele extends BaseElement {
    constructor() {
      super()
      // 设置当前组件实例, 并返回父组件实例
      const { old: parentComponent, restore } = setComponentIns(this)
      this.$data = reactive(data?.() || {})
      this.$methods = methods || {}

      // 获取监视的属性
      for (const attr of observedAttributes ?? []) {
        if (this.hasAttribute(attr)) {
          this.$props[attr] = this.getAttribute(attr)
        }
      }

      const shadow = this.$shadowRoot

      /*@__PURE__*/ checkPropsEmit<Func>(emit ?? {}, this)
      /*@__PURE__*/ checkPropsEmit(props ?? {}, this)

      // TODO: 此处的key的类型声明存在问题
      // 包装父组件暴露的方法
      const emitFn = (key: string, ...args: unknown[]): unknown => {
        if (parentComponent && emit) {
          const _emit = emit
          const parentAttrs = parentComponent.$exposeAttributes
          if (key in _emit) {
            // 父组件暴露了该方法, 调用父组件的方法
            if (key in parentAttrs && typeof parentAttrs[key] === 'function') {
              return parentAttrs[key](...args)
            }
            // 非必须的方法, 且有默认值
            else if (
              !_emit[key].required &&
              typeof _emit[key].default === 'function'
            ) {
              const fn = _emit[key].default
              return (...args: Parameters<typeof fn>) => {
                const { restore } = setComponentIns(this)
                const _return = fn(...args)
                restore()
                return _return
              }
            }
          }
          /*@__PURE__*/ console.error(
            (() => {
              if (!(key in parentAttrs) && _emit[key]?.required) {
                return `${this.localName}: ${parentComponent.localName} 未暴露 ${key} 方法。`
              }
              if (!(key in _emit)) {
                return `${this.localName}: 未定义 emit: ${key} 方法。`
              }
              return `${this.localName}: ${parentComponent.localName} ${key} 不是一个方法。`
            })()
          )
        } else {
          /*@__PURE__*/ console.warn(
            (() => {
              if (!parentComponent) {
                return `${this.localName}: 未找到父组件实例。`
              }
              return `${this.localName}: 未定义 emit: ${key} 方法。`
            })()
          )
        }
      }

      // 从父组件的暴露中获取props定义的属性
      if (props && parentComponent) {
        const _props = props
        const parentAttrs = parentComponent.$exposeAttributes
        for (const key in _props) {
          const { default: def, required } = _props[key]
          if (key in parentAttrs) {
            this.$props[key] = parentAttrs[key]
          } else if (!required && 'default' in _props[key]) {
            this.$props[key] = def
          } else {
            /*@__PURE__*/ console.error(
              (() => {
                if (required) {
                  return `${this.localName}: ${parentComponent.localName} 未暴露 ${key} 属性。`
                }
                return `${this.localName}: 未定义 ${key} 属性。`
              })()
            )
          }
        }
      }

      setRunningSetup(true)
      // 获取setup中的数据
      const setupData =
        setup?.(this.$props, {
          expose: exposeAttributes,
          emit: emitFn
        }) || {}
      setRunningSetup(false)

      // Lifecycle: beforeCreate 调用时机
      runBeforeCreate()

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
          const { restore } = setComponentIns(this)
          const _return = fn(...args)
          restore()
          return _return
        }
      }

      clearBeforeCreate()
      // Lifecycle: created 调用时机
      runCreated()

      // 如果需要，在此处运行模板编译器

      clearCreated()
      // Lifecycle: beforeMount 调用时机
      runBeforeMount(this)

      // 创建模板
      if (typeof template === 'string') shadow.innerHTML = template

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
        // TODO: 这里的类型声明有问题: HTMLElement[]
        {} as Record<(typeof BaseElement.events)[number], HTMLElement[]>
      )

      // 绑定事件
      for (const event in elements) {
        elements[event as EventHandlers].forEach((ele) => {
          const target = ele
          const fnName = target.getAttribute(`on-${event}`)
          if (!fnName) return
          const fn =
            this.$methods[fnName as keyof typeof this.$methods]?.bind(this)
          if (!fn) {
            return /*@__PURE__*/ console.error(
              `${this.localName}: 未定义 ${fnName} 方法。`
            )
          }
          target.addEventListener(event, (e: Event) => {
            fn(e)
          })
        })
      }

      // 恢复父组件实例
      restore()
    }

    static get observedAttributes() {
      return observedAttributes || []
    }

    connectedCallback() {
      const { restore } = setComponentIns(this)
      // WARN: 由于暂时没有多文档支持, 所以暂时不需要考虑多文档的情况
      // 在多文档的情况下, 此函数会被调用多次，而当前clearBeforeMount、clearMounted仅支持单次调用
      clearBeforeMount(this)
      // Lifecycle: mounted 调用时机
      runMounted(this)
      connected?.call(this, this.$data, { methods: this.$methods })
      restore()
    }

    disconnectedCallback() {
      const { restore } = setComponentIns(this)
      clearMounted(this)
      // Lifecycle: unmounted 调用时机
      runUnmounted()
      disconnected?.call(this, this.$data, { methods: this.$methods })
      restore()
    }

    adoptedCallback() {
      const { restore } = setComponentIns(this)
      // Lifecycle: 暂时没有多文档支持
      adopted?.call(this, this.$data, { methods: this.$methods })
      restore()
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
      const { restore } = setComponentIns(this)
      this.$props[name] = newValue
      attributeChanged?.call(this, name, oldValue, newValue, this.$data, {
        methods: this.$methods
      })
      restore()
    }
  }

  return () => customElements.define(name, Ele, options)
}

export default define

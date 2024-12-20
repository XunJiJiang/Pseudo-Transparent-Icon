/* eslint-disable @typescript-eslint/no-explicit-any */
// 为了在自定义组件中使用类型推断, 需要使用any
/*
 * WARN: 可能存在的问题:
 * 1. 在单个自定义组件内创建出超出一层的自定义组件时,
 *    子组件只能获取到最外层的父组件实例, 无法获取到中间的父组件实例
 *    就这样挺好, 不需要关心中间的组件实例
 */

import { Func } from '@type/function'
import BaseElement, { SYMBOL_INIT } from './BaseElement'
import { setComponentIns } from './fixComponentIns'
import { startSetupRunning } from '../hooks/lifecycle/verifySetup'
import {
  clearBeforeMount,
  runBeforeMount
} from '../hooks/lifecycle/beforeMount'
import { clearMounted, runMounted } from '../hooks/lifecycle/mounted'
import { hasOwn, isArray, notNull } from '../utils/shared'

type Shared = Record<string | symbol, any>

type Exposed = Record<string | symbol, any>

// export type DefineProps<T extends Record<string | symbol, any>> = T

// export type DefineEmit<T extends Record<string | symbol, any>> = (
//   key: keyof T,
//   ...args: Parameters<T[keyof T]>
// ) => ReturnType<T[keyof T]>

export interface EleCallback {
  (this: BaseElement, context: { data: Shared }): void
}

export interface EleAttributeChangedCallback {
  (
    this: BaseElement,
    change: {
      name: string
      oldValue: string
      newValue: string
    },
    context: { data: Shared }
  ): void
}

type DefaultOptions<T extends string = string, K = any> = {
  [key in T]: {
    default?: K extends Func ? Func : any
    required?: boolean
  }
}

type BaseProps = {
  [key: string | symbol]: any
}

type BaseEmits = {
  [key: string]: Func
}

type DefineProps<T extends BaseProps> = {
  [key in keyof T]: {
    default?: T[key]
    required?: boolean
  }
}

type DefineEmits<T extends BaseEmits> = {
  [key in keyof T]: {
    default?: T[key]
    required?: boolean
  }
}

const checkPropsEmit = /*@__PURE__*/ <T extends string, K>(
  opts: DefaultOptions<T, K>,
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

// 不能使用on-开头的属性
const checkObservedAttributes = /*@__PURE__*/ (attrs: string[]) => {
  for (const attr of attrs) {
    if (/^(on-)/.test(attr)) {
      /*@__PURE__*/ console.error(
        `observedAttributes: ${attr} 不能以 on- 开头。`
      )
    } else if (reservedKeys.includes(attr)) {
      /*@__PURE__*/ console.error(`observedAttributes: ${attr} 为保留键。`)
    }
  }
}

const isObservableAttr = <T extends string>(
  key: string,
  observedAttributes: T[]
): key is T => {
  return observedAttributes.includes(key as T)
}

/** 保留键 */
const reservedKeys = ['ref', 'expose']

type ReservedKey = 'ref' | 'expose'

export const isReservedKey = (key: string): key is ReservedKey =>
  reservedKeys.includes(key)

/** 记录自定义web组件名 */
const customElementNameSet = new Set<string>()

/** 是否是自定义web组件 */
export const isCustomElement = (
  _el: Element,
  name: string
): _el is BaseElement => customElementNameSet.has(name)

export const defineCustomElement = <
  A extends BaseProps,
  B extends string,
  C extends BaseEmits
>(
  name: string,
  {
    style,
    shadow = true,
    setup,
    props,
    emit,
    observedAttributes,
    connected,
    disconnected,
    adopted,
    attributeChanged
    // ...rest
  }: {
    style?: string | ((props: any) => string)
    shadow?: boolean
    setup: (
      props: {
        [key in keyof A]: A[key]
      } & {
        [key in B]: string
      },
      context: {
        expose: (methods: Exposed) => void
        share: (methods: Shared) => void
        emit: <T extends keyof C & string>(
          key: T,
          ...args: Parameters<C[T]>
        ) => ReturnType<C[T]>
      }
    ) => Node | Node[] | void
    props?: DefineProps<A>
    emit?: DefineEmits<C>
    observedAttributes?: B[]
    connected?: EleCallback
    disconnected?: EleCallback
    adopted?: EleCallback
    attributeChanged?: EleAttributeChangedCallback
  },
  options?: ElementDefinitionOptions
): (() => void) => {
  if (customElementNameSet.has(name.toLowerCase())) {
    /*@__PURE__*/ console.error(`自定义组件 ${name} 重复定义。`)
    return () => {}
  }

  const _shadow = shadow

  if (style && !shadow) {
    const styleEle = document.createElement('style')
    if (typeof style === 'string') styleEle.textContent = style
    else if (typeof style === 'function') {
      /*@__PURE__*/ console.error(
        `${name}: 当不使用shadow时, style只能是string类型。`
      )
    }
    document.body.appendChild(styleEle)
  }

  class Ele extends BaseElement<
    {
      [key in keyof A]: A[key]
    } & {
      [key in B]: string
    }
  > {
    constructor() {
      super()
      // 设置当前组件实例, 并返回父组件实例
      const { restore } = setComponentIns(this)
      this.$sharedData = {}

      const _observedAttributes = observedAttributes || []

      // TODO: 在解决 "不使用Shadow Root的元素绑定数据时外部会获取到子组件内容" 的问题前, 强制使用Shadow Root
      if (_shadow) {
        this.$root = this.attachShadow({ mode: 'open' })
      } else {
        this.$root = this
      }

      /*@__PURE__*/ checkPropsEmit<string, Func>(emit ?? {}, this)
      /*@__PURE__*/ checkPropsEmit(props ?? {}, this)
      /*@__PURE__*/ checkObservedAttributes(_observedAttributes)

      // 恢复父组件实例
      restore()
    }

    static get observedAttributes() {
      return observedAttributes || []
    }

    get obAttr() {
      return observedAttributes || []
    }

    connectedCallback() {
      const { old: parentComponent, restore } = setComponentIns(this)
      this.$parentComponent = parentComponent

      const shadow = this.$root

      const _observedAttributes = observedAttributes || []

      // 获取observedAttributes定义属性的键值
      const attrs = Array.from(this.attributes)
      for (const attr of attrs) {
        const { name, value } = attr
        if (isObservableAttr<B>(name, _observedAttributes)) {
          ;(
            this.$props as {
              [key in B]: string
            }
          )[name] = value
        } else if (reservedKeys.includes(name)) {
          continue
        }
        // else {
        //   /*@__PURE__*/ console.warn(
        //     `由 ${parentComponent?.localName} 赋予 ${this.localName} 的属性 ${name} 可能不被 ${name} 需要。`
        //   )
        // }
      }

      // 从父组件的暴露中获取props定义的属性
      if (props) {
        const _props = props
        const propData = this.$propData
        for (const key in _props) {
          const { default: def, required } = _props[key]
          if (key in propData) {
            this.$props[key] = propData[key]
          } else if (!required && 'default' in _props[key] && notNull(def)) {
            this.$props[key] = def
          } else {
            /*@__PURE__*/ console.error(
              (() => {
                if (
                  !required &&
                  (!('default' in _props[key]) || !notNull(def))
                ) {
                  return `${this.localName}: ${key} 为非必须属性, 但未设置有效默认值。`
                } else if (required && !propData[key]) {
                  return `${this.localName}: ${key} 为必须属性, 但未传递值。`
                } else {
                  return `${this.localName}: 未知错误`
                }
              })()
            )
          }
        }
      }

      // 包装父组件暴露的方法
      const emitFn = <T extends keyof C & string>(
        key: T,
        ...args: Parameters<C[T]>
      ): ReturnType<C[T]> => {
        if (
          emit &&
          (hasOwn(this.$emitMethods, key) || !emit[key].required) &&
          hasOwn(emit, key)
        ) {
          const emitMethods = this.$emitMethods

          const _emit = emit

          if (typeof emitMethods[key] === 'function') {
            const fn = emitMethods[key]
            return fn(...args)
          }
          // 非必须的方法, 且有默认值
          else if (
            !_emit[key].required &&
            typeof _emit[key].default === 'function'
          ) {
            const fn = _emit[key].default
            const { restore } = setComponentIns(this)
            const _return = fn(...args)
            restore()
            return _return
          }

          /*@__PURE__*/ console.error(
            (() => {
              const parentName = this.$parentComponent?.localName ?? ''
              if (
                hasOwn(emitMethods, key) &&
                typeof emitMethods[key] !== 'function'
              ) {
                return `on-${key} 需要的类型为 function, 而 ${parentName} 向 ${this.localName} 传递了类型为 ${typeof emitMethods[key]} 的值`
              } else if (
                !_emit[key].required &&
                typeof _emit[key].default !== 'function'
              ) {
                return `在 ${parentName} 中创建的 ${this.localName} 的 on-${key} 属性为空, 且没有默认值`
              }

              return `${this.localName}(${emitFn}): 未知错误`
            })()
          )

          return void 0 as ReturnType<C[typeof key]>
        } else {
          /*@__PURE__*/ console.error(
            (() => {
              const parentName = this.$parentComponent?.localName ?? ''
              if (!emit) {
                return `${this.localName} 未定义任何 emit`
              } else if (!hasOwn(emit, key)) {
                return `${this.localName} 未定义 emit: ${key}`
              } else if (
                emit[key].required &&
                !hasOwn(this.$emitMethods, key)
              ) {
                return `在 ${parentName} 中创建的 ${this.localName} 的 on-${key} 属性为空, 而该值为必传`
              }

              return `${this.localName}(${emitFn}): 未知错误`
            })()
          )
        }
        return void 0 as ReturnType<C[typeof key]>
      }

      const exposeData = (methods: Exposed) => {
        for (const key in methods) {
          if (key in this.$exposedData) {
            /*@__PURE__*/ console.warn(
              `${this.localName} 重复暴露 ${key} 属性，旧的值将被覆盖。`
            )
          }
          const _val = methods[key]
          this.$exposedData[key] = _val
        }
      }

      const shareData = (attrs: Shared) => {
        for (const key in attrs) {
          if (key in this.$sharedData) {
            /*@__PURE__*/ console.warn(
              `${this.localName} 重复暴露 ${key} 属性，旧的值将被覆盖。`
            )
          }
          const _val = attrs[key]
          this.$sharedData[key] = _val
        }
      }

      const { end: setupEnd } = startSetupRunning()
      // 获取setup中的数据
      const setupData =
        setup(this.$props, {
          expose: exposeData,
          share: shareData,
          emit: emitFn
        }) || {}

      setupEnd()

      // Lifecycle: beforeMount 调用时机
      runBeforeMount(this)

      // 创建模板
      if (setupData instanceof Node) {
        shadow.appendChild(setupData)
      } else if (
        isArray(setupData) &&
        setupData.every((ele) => ele instanceof Node)
      ) {
        setupData.forEach((ele) => {
          if (ele instanceof Node) shadow.appendChild(ele)
        })
      }

      // 创建 style 标签
      if (style && _shadow) {
        const styleEle = document.createElement('style')
        if (typeof style === 'string') styleEle.textContent = style
        else if (typeof style === 'function')
          styleEle.textContent = style(this.$props)
        shadow.appendChild(styleEle)
      }

      // 由于规定effect需要在组件创建开始，onMount 运行前就要创建，而目前使用startSetupRunning来限制在setup中运行
      // 所以这里需要先模拟为在setup内

      // TODO: 在移除全部对shadow.querySelectorAll的使用后，即可放开shadow选项
      // 则修改样式绑定的方式

      // WARN: 由于暂时没有多文档支持, 所以暂时不需要考虑多文档的情况
      clearBeforeMount(this)
      // Lifecycle: mounted 调用时机
      runMounted(this)

      connected?.call(this, {
        data: this.$sharedData
      })
      restore()
    }

    disconnectedCallback() {
      const { restore } = setComponentIns(this)
      clearMounted(this)
      disconnected?.call(this, {
        data: this.$sharedData
      })
      restore()
      super.__init__(SYMBOL_INIT)
    }

    adoptedCallback() {
      const { restore } = setComponentIns(this)
      // Lifecycle: 暂时没有多文档支持
      adopted?.call(this, {
        data: this.$sharedData
      })
      restore()
    }

    attributeChangedCallback(name: B, oldValue: string, newValue: string) {
      const { restore } = setComponentIns(this)
      ;(
        this.$props as {
          [key in B]: string
        }
      )[name] = newValue
      attributeChanged?.call(
        this,
        { name, oldValue, newValue },
        {
          data: this.$sharedData
        }
      )
      restore()
    }
  }

  return () => {
    customElementNameSet.add(name.toLowerCase())
    customElements.define(name, Ele, options)
  }
}

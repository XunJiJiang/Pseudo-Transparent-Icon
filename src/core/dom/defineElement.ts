/* eslint-disable @typescript-eslint/no-explicit-any */
// 为了在自定义组件中使用类型推断, 需要使用any
/*
 * WARN: 可能存在的问题:
 * 1. 在单个自定义组件内创建出超出一层的自定义组件时,
 *    子组件只能获取到最外层的父组件实例, 无法获取到中间的父组件实例
 *    就这样挺好, 不需要关心中间的组件实例
 */

import { Func } from '@type/function'
import BaseElement, { SYMBOL_CLEAR_REF } from './BaseElement'
import { setComponentIns } from './fixComponentIns'
import { exposeData } from './exposeData'
import { shareData } from './sharedData'
import { startSetupRunning } from '../hooks/lifecycle/verifySetup'
import {
  clearBeforeCreate,
  runBeforeCreate
} from '../hooks/lifecycle/beforeCreate'
import { clearCreated, runCreated } from '../hooks/lifecycle/created'
import {
  clearBeforeMount,
  runBeforeMount
} from '../hooks/lifecycle/beforeMount'
import { clearMounted, runMounted } from '../hooks/lifecycle/mounted'
import { runUnmounted } from '../hooks/lifecycle/unmounted'
import { hasOwn, isArray } from '../utils/shared'

type DataType = Record<string | symbol, any>

// export type DefineProps<T extends Record<string | symbol, any>> = T

// export type DefineEmit<T extends Record<string | symbol, any>> = (
//   key: keyof T,
//   ...args: Parameters<T[keyof T]>
// ) => ReturnType<T[keyof T]>

interface EleCallback {
  (this: BaseElement, context: { data: DataType }): void
}

interface EleAttributeChangedCallback {
  (
    this: BaseElement,
    change: {
      name: string
      oldValue: string
      newValue: string
    },
    context: { data: DataType }
  ): void
}

type DefaultOptions<T extends string = string, K = any> = {
  [key in T]: {
    default?: K extends Func ? Func : any
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

/** 保留键 */
const reservedKeys = ['ref', 'expose']

/** 记录自定义web组件名 */
const customElementNameSet = new Set<string>()

/** 是否是自定义web组件 */
export const isCustomElement = (name: string) => customElementNameSet.has(name)

const beforeRemove = (ele: Node, root: BaseElement) => {
  if (ele instanceof Element) {
    const nodeRefAttr = ele.attributes.getNamedItem('ref')
    const nodeExposeAttr = ele.attributes.getNamedItem('expose')
    if (nodeRefAttr) {
      const refName = nodeRefAttr.value
      if (ele === root.$defineRefs[refName]) delete root.$defineRefs[refName]
      if (refName in root.$refs) {
        if (root.$refs[refName].value === ele) root.$refs[refName].value = null
      }
    }

    if (nodeExposeAttr) {
      if (ele instanceof BaseElement) {
        const exposeName = nodeExposeAttr.value
        if (ele.$exposedData === root.$defineExposes[exposeName])
          delete root.$defineExposes[exposeName]
        if (exposeName in root.$exposes) {
          if (root.$exposes[exposeName].value === ele.$exposedData)
            root.$exposes[exposeName].value = null
        }
      }
    }

    if (ele instanceof BaseElement) {
      ele.__destroy__(SYMBOL_CLEAR_REF)
    }

    const childNodes = Array.from(ele.childNodes)
    childNodes.forEach((child) => {
      beforeRemove(child, root)
    })
  }
}

const beforeAppend = (ele: Node, root: BaseElement) => {
  if (ele instanceof Element) {
    const nodeRefAttr = ele.attributes.getNamedItem('ref')
    const nodeExposeAttr = ele.attributes.getNamedItem('expose')
    if (nodeRefAttr) {
      const refName = nodeRefAttr.value
      if (root.$defineRefs[refName]) {
        /*@__PURE__*/ console.warn(
          `${root.localName}: ref 属性 ${refName} 已存在引用，创建同名引用会导致上一个引用被丢弃。`
        )
      }

      root.$defineRefs[refName] = ele
      if (refName in root.$refs) {
        root.$refs[refName].value = ele
      }
    }

    if (nodeExposeAttr) {
      if (ele instanceof BaseElement) {
        const exposeName = nodeExposeAttr.value
        root.$defineExposes[exposeName] = ele.$exposedData
        if (exposeName in root.$exposes) {
          root.$exposes[exposeName].value = ele.$exposedData
        }
      } else {
        /*@__PURE__*/ console.error(
          `${root.localName}: expose 属性只能用于自定义组件, 此处错误的使用在 ${ele.localName} 上。`
        )
      }
    }

    replaceMethods(ele, root)
  }
}

const replaceMethods = (ele: Element, root: BaseElement) => {
  if (ele instanceof BaseElement) return

  const nodeRemove = ele.remove.bind(ele)
  const nodeAppend = ele.appendChild.bind(ele)
  const nodeRemoveChild = ele.removeChild.bind(ele)
  const nodePrepend = ele.prepend.bind(ele)
  const nodeInsertBefore = ele.insertBefore.bind(ele)
  const nodeReplaceChild = ele.replaceChild.bind(ele)

  /** 恢复原方法 */
  const restore = () => {
    ele.remove = nodeRemove
    ele.appendChild = nodeAppend
    ele.removeChild = nodeRemoveChild
    ele.prepend = nodePrepend
    ele.insertBefore = nodeInsertBefore
    ele.replaceChild = nodeReplaceChild
  }

  ele.remove = () => {
    beforeRemove(ele, root)
    restore()
    nodeRemove()
  }
  ele.appendChild = <T extends Node>(node: T): T => {
    beforeAppend(node, root)
    return nodeAppend(node)
  }
  ele.removeChild = <T extends Node>(node: T): T => {
    beforeRemove(node, root)
    restore()
    return nodeRemoveChild(node)
  }
  ele.prepend = (...nodes: (Node | string)[]) => {
    nodes.forEach((node) => {
      if (typeof node !== 'string') {
        beforeAppend(node, root)
      }
    })
    nodePrepend(...nodes)
  }
  ele.insertBefore = <T extends Node>(
    newNode: T,
    referenceNode: Node | null
  ): T => {
    beforeAppend(newNode, root)
    return nodeInsertBefore(newNode, referenceNode)
  }
  ele.replaceChild = <T extends Node>(newNode: Node, oldNode: T): T => {
    beforeRemove(oldNode, root)
    restore()
    beforeAppend(newNode, root)
    return nodeReplaceChild(newNode, oldNode)
  }
}

const defineCustomElement = (
  name: string,
  {
    style,
    // shadow = true,
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
    // shadow?: boolean
    setup: (
      props: any,
      context: {
        expose: (methods: DataType) => void
        share: (methods: DataType) => void
        emit: <T extends Record<string, Func> = Record<string, Func>>(
          key: keyof T & string,
          ...args: Parameters<T[typeof key]>
        ) => ReturnType<T[typeof key]>
      }
    ) => Node | Node[] | void
    props?: DefaultOptions
    emit?: DefaultOptions<string, Func>
    observedAttributes?: string[]
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

  // const _shadow = shadow
  class Ele extends BaseElement {
    constructor() {
      super()
      // 设置当前组件实例, 并返回父组件实例
      const { restore } = setComponentIns(this)
      this.$sharedData = {}

      const _observedAttributes = observedAttributes || []

      // TODO: 在解决 "不使用Shadow Root的元素绑定数据时外部会获取到子组件内容" 的问题前, 强制使用Shadow Root
      // if (_shadow) {
      //   this.$root = this.attachShadow({ mode: 'open' })
      // } else {
      //   this.$root = this
      // }

      /*@__PURE__*/ checkPropsEmit<string, Func>(emit ?? {}, this)
      /*@__PURE__*/ checkPropsEmit(props ?? {}, this)
      /*@__PURE__*/ checkObservedAttributes(_observedAttributes)

      // 恢复父组件实例
      restore()
    }

    static get observedAttributes() {
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
        if (_observedAttributes.includes(name)) {
          this.$props[name] = value
        } else if (reservedKeys.includes(name)) {
          continue
        }
        // else {
        //   /*@__PURE__*/ console.warn(
        //     `由 ${parentComponent?.localName} 赋予 ${this.localName} 的属性 ${name} 可能不被 ${name} 需要。`
        //   )
        // }
      }

      // TODO: 此处的key的类型声明存在问题
      // 包装父组件暴露的方法
      const emitFn = <T extends Record<string, Func> = Record<string, Func>>(
        key: keyof T & string,
        ...args: Parameters<T[typeof key]>
      ): ReturnType<T[typeof key]> => {
        if (
          emit &&
          (hasOwn(this.$emitMethods, key) || !emit[key].required) &&
          hasOwn(emit, key)
        ) {
          const emitMethods = this.$emitMethods

          const _emit = emit as DefaultOptions<keyof T & string, Func>

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

          return undefined as ReturnType<T[typeof key]>
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
        return undefined as ReturnType<T[typeof key]>
      }

      // 从父组件的暴露中获取props定义的属性
      if (props) {
        const _props = props
        const propData = this.$propData
        for (const key in _props) {
          const { default: def, required } = _props[key]
          if (key in propData) {
            this.$props[key] = propData[key]
          } else if (!required && 'default' in _props[key]) {
            this.$props[key] = def
          } else {
            /*@__PURE__*/ console.error(
              (() => {
                // TODO:
              })()
            )
          }
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

      if (setupData instanceof Node) {
        // TODO:
      }

      // Lifecycle: beforeCreate 调用时机
      runBeforeCreate()

      setupEnd()

      clearBeforeCreate()
      // Lifecycle: created 调用时机
      runCreated()

      clearCreated()
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
      if (style) {
        const styleEle = document.createElement('style')
        if (typeof style === 'string') styleEle.textContent = style
        else if (typeof style === 'function')
          styleEle.textContent = style(this.$props)
        shadow.appendChild(styleEle)
      }

      // 由于规定effect需要在组件创建开始，onMount 运行前就要创建，而目前使用startSetupRunning来限制在setup中运行
      // 所以这里需要先模拟为在setup内

      // 获取定义了ref属性的元素
      const refEles = Array.from(shadow.querySelectorAll('[ref]'))
      refEles.forEach((ele: Element) => {
        const refName = ele.getAttribute('ref')
        replaceMethods(ele, this)
        if (!refName) return
        this.$defineRefs[refName] = ele
        if (refName in this.$refs) {
          this.$refs[refName].value = ele
        }
      })

      // 获取定义了expose属性的元素
      const exposeEles = Array.from(shadow.querySelectorAll('[expose]'))
      // 使用exposeTemplate声明的元素
      exposeEles.forEach((ele: Element) => {
        const exposeName = ele.getAttribute('expose')
        if (!exposeName) {
          return /*@__PURE__*/ console.error(
            `${this.localName}: expose 属性不能为空。`
          )
        } else if (!(ele instanceof BaseElement)) {
          return /*@__PURE__*/ console.error(
            `${this.localName}: expose 属性只能用于自定义组件。`
          )
        }
        this.$defineExposes[exposeName] = ele.$exposedData
        if (exposeName in this.$exposes) {
          this.$exposes[exposeName].value = this.$defineExposes[exposeName]
        }
      })

      const exposeTemplates = /*@__PURE__*/ Object.entries(this.$exposes)
      /*@__PURE__*/ exposeTemplates.forEach(([key, value]) => {
        if (value) return
        console.error(
          `${this.localName}: 尝试使用exposeTemplate获取${key}, 但没有在任何自定义组将上定义[expose=${key}]。`
        )
      })

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

      // Lifecycle: unmounted 调用时机
      runUnmounted()
      disconnected?.call(this, {
        data: this.$sharedData
      })
      restore()
    }

    adoptedCallback() {
      const { restore } = setComponentIns(this)
      // Lifecycle: 暂时没有多文档支持
      adopted?.call(this, {
        data: this.$sharedData
      })
      restore()
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
      const { restore } = setComponentIns(this)
      this.$props[name] = newValue
      attributeChanged?.call(
        this,
        { name, oldValue, newValue },
        {
          data: this.$sharedData
        }
      )
      restore()
    }

    remove() {
      const { restore } = setComponentIns(this)
      if (this.$parentComponent) beforeRemove(this, this.$parentComponent)
      super.remove()
      restore()
    }

    appendChild<T extends Node>(node: T): T {
      const { restore } = setComponentIns(this)
      beforeAppend(node, this)
      const _ret = super.appendChild(node)
      restore()
      return _ret
    }

    removeChild<T extends Node>(node: T): T {
      const { restore } = setComponentIns(this)
      beforeRemove(node, this)
      const _ret = super.removeChild(node)
      restore()
      return _ret
    }

    prepend(...nodes: (Node | string)[]) {
      const { restore } = setComponentIns(this)
      nodes.forEach((node) => {
        if (typeof node !== 'string') {
          beforeAppend(node, this)
        }
      })
      const _ret = super.prepend(...nodes)
      restore()
      return _ret
    }

    insertBefore<T extends Node>(newNode: T, referenceNode: Node | null): T {
      const { restore } = setComponentIns(this)
      beforeAppend(newNode, this)
      const _ret = super.insertBefore(newNode, referenceNode)
      restore()
      return _ret
    }

    replaceChild<T extends Node>(newNode: Node, oldNode: T): T {
      const { restore } = setComponentIns(this)
      beforeRemove(oldNode, this)
      beforeAppend(newNode, this)
      const _ret = super.replaceChild(newNode, oldNode)
      restore()
      return _ret
    }
  }

  return () => {
    customElementNameSet.add(name.toLowerCase())
    customElements.define(name, Ele, options)
  }
}

export default defineCustomElement

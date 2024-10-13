/* eslint-disable @typescript-eslint/no-explicit-any */
// 为了在自定义组件中使用类型推断, 需要使用any
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
import { hasOwn, isObject } from './utils/shared'
import { effect, isRef } from './Dependency'

type DataType = Record<string | symbol, any>

// export type DefineProps<T extends Record<string | symbol, any>> = T

// export type DefineEmit<T extends Record<string | symbol, any>> = (
//   key: keyof T,
//   ...args: Parameters<T[keyof T]>
// ) => ReturnType<T[keyof T]>

interface EleCallback {
  (
    this: BaseElement,
    data: DataType,
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
    data: DataType,
    context: {
      methods: Record<string, Func>
    }
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

// 不能使用on-、x-开头的属性
const checkObservedAttributes = /*@__PURE__*/ (attrs: string[]) => {
  for (const attr of attrs) {
    if (/^(on-|x-)/.test(attr)) {
      /*@__PURE__*/ console.error(
        `observedAttributes: ${attr} 不能以 on- 或 x- 开头。`
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

const SYMBOL_NONE = Symbol('none')

/** 是否是自定义web组件 */
const isCustomElement = (name: string) => customElementNameSet.has(name)

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
        if (ele.$exposeAttributes === root.$defineExposes[exposeName])
          delete root.$defineExposes[exposeName]
        if (exposeName in root.$exposes) {
          if (root.$exposes[exposeName].value === ele.$exposeAttributes)
            root.$exposes[exposeName].value = null
        }
      }
    }
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
        root.$defineExposes[exposeName] = ele.$exposeAttributes
        if (exposeName in root.$exposes) {
          root.$exposes[exposeName].value = ele.$exposeAttributes
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
  const nodeRemove = ele.remove.bind(ele)
  const nodeAppend = ele.appendChild.bind(ele)
  const nodeRemoveChild = ele.removeChild.bind(ele)
  const nodePrepend = ele.prepend.bind(ele)
  const nodeInsertBefore = ele.insertBefore.bind(ele)
  const nodeReplaceChild = ele.replaceChild.bind(ele)

  ele.remove = () => {
    beforeRemove(ele, root)
    nodeRemove()
  }
  ele.appendChild = <T extends Node>(node: T): T => {
    beforeAppend(node, root)
    return nodeAppend(node)
  }
  ele.removeChild = <T extends Node>(node: T): T => {
    beforeRemove(node, root)
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
    beforeAppend(newNode, root)
    return nodeReplaceChild(newNode, oldNode)
  }
}

/** is string、number、bigint、boolean、null */
const isSimpleType = (val: any) =>
  typeof val === 'string' ||
  typeof val === 'number' ||
  typeof val === 'bigint' ||
  typeof val === 'boolean' ||
  val === null

/** 检测要绑定到非自定义组件的元素的值是否合法 */
const checkValue = /*@__PURE__*/ (value: any, ele: Element, key: string) => {
  if (isObject(value)) {
    if (isRef(value)) {
      if (isSimpleType(value.value)) {
        return
      }
    }
  } else {
    if (isSimpleType(value)) {
      return
    }
  }

  console.error(key, value)
  throw new TypeError(
    `${ele.localName}: ${key} 不是一个可用的值。原生元素数据绑定限制值必须为 string，number，bigint，boolean，null 或包含上述类型值的ref`
  )
}

const define = (
  name: string,
  {
    template,
    style,
    shadow = true,
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
    template?: string | ((props: any) => string)
    style?: string | ((props: any) => string)
    shadow?: boolean
    setup?: (
      props: any,
      context: {
        expose: (methods: DataType) => void
        emit: <T extends Record<string, Func> = Record<string, Func>>(
          key: keyof T & string,
          ...args: Parameters<T[typeof key]>
        ) => ReturnType<T[typeof key]>
      }
    ) => DataType | void
    props?: DefaultOptions
    emit?: DefaultOptions<string, Func>
    // TODO: data的类型声明存在
    data?: () => DataType
    methods?: Record<string, (this: BaseElement, ...args: any[]) => void>
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

  const _shadow = shadow
  class Ele extends BaseElement {
    constructor() {
      super()
      // 设置当前组件实例, 并返回父组件实例
      const { old: parentComponent, restore } = setComponentIns(this)
      this.$parentComponent = parentComponent
      this.$data = reactive(data?.() || {})
      this.$methods = methods || {}

      const _observedAttributes = observedAttributes || []

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

    connectedCallback() {
      const { old: parentComponent, restore } = setComponentIns(this)

      const shadow = this.$root

      if (!shadow) return
      const _observedAttributes = observedAttributes || []

      // 获取on-、x-开头的和observedAttributes定义属性的键值
      const attrs = Array.from(this.attributes)
      const _propsKey = {} as Record<string, string | typeof SYMBOL_NONE>
      const _emitKey = {} as Record<string, string | typeof SYMBOL_NONE>
      for (const attr of attrs) {
        const { name, value } = attr
        if (/^(on-)/.test(name)) {
          _emitKey[name.slice(3)] = value !== '' ? value : SYMBOL_NONE
        } else if (/^(x-)/.test(name)) {
          _propsKey[name.slice(2)] = value !== '' ? value : SYMBOL_NONE
        } else if (_observedAttributes.includes(name)) {
          this.$props[name] = value
        } else if (reservedKeys.includes(name)) {
          continue
        } else {
          /*@__PURE__*/ console.warn(
            `由 ${parentComponent?.localName} 赋予 ${this.localName} 的属性 ${name} 可能不被 ${name} 需要。`
          )
        }
      }

      // TODO: 此处的key的类型声明存在问题
      // 包装父组件暴露的方法
      const emitFn = <T extends Record<string, Func> = Record<string, Func>>(
        key: keyof T & string,
        ...args: Parameters<T[typeof key]>
      ): ReturnType<T[typeof key]> => {
        if (
          parentComponent &&
          emit &&
          hasOwn(parentComponent.$methods, _emitKey[key]) &&
          hasOwn(emit, key)
        ) {
          const parentMethods = parentComponent.$methods
          const _emit = emit as DefaultOptions<keyof T & string, Func>
          const _parentKey = _emitKey[key] as string | typeof SYMBOL_NONE

          // 父组件暴露了该方法, 调用父组件的方法
          if (
            hasOwn<{
              [key in typeof _parentKey]: Func
            }>(parentMethods, _parentKey)
          ) {
            const fn = parentMethods[_parentKey]
            return fn(...args)
          }
          // 非必须的方法, 且有默认值
          else if (
            !_emit[key].required &&
            typeof _emit[key].default === 'function' &&
            _parentKey !== SYMBOL_NONE
          ) {
            const fn = _emit[key].default
            const { restore } = setComponentIns(this)
            const _return = fn(...args)
            restore()
            return _return
          }

          /*@__PURE__*/ console.error(
            (() => {
              if (_emit[key].required) {
                if (_parentKey !== SYMBOL_NONE) {
                  return `${this.localName}: ${parentComponent.localName} 没有定义 ${_parentKey} 方法。`
                }
                return `${this.localName}: ${parentComponent.localName} 未赋予当前组件 ${key} 方法。事件绑定的值不能为空。`
              }
              return `${this.localName}: ${parentComponent.localName} ${key} 不是一个方法。`
            })()
          )

          return undefined as ReturnType<T[typeof key]>
        } else {
          /*@__PURE__*/ console.error(
            (() => {
              if (!parentComponent) {
                return `${this.localName}: 未找到父组件实例。`
              } else if (!emit) {
                return `${this.localName}: 未定义 emit。`
              } else if (!hasOwn(parentComponent.$methods, _emitKey[key])) {
                if (_emitKey[key] === SYMBOL_NONE) {
                  return `${this.localName}: ${parentComponent.localName} 未赋予当前组件 ${key} 方法。事件绑定的值不能为空。`
                }
                if (typeof _emitKey[key] === 'undefined') {
                  return `${parentComponent.localName}: ${this.localName} 未定义 on-${key} 属性。`
                } else {
                  return `${this.localName}: ${parentComponent.localName} 未定义 ${_emitKey[key]} 方法。`
                }
              }
              return `${this.localName}: emit 未定义 ${key} 方法。`
            })()
          )
        }
        return undefined as ReturnType<T[typeof key]>
      }

      // 从父组件的暴露中获取props定义的属性
      if (props && parentComponent) {
        const _props = props
        const parentData = parentComponent.$data
        for (const key in _props) {
          const _parentKey = _propsKey[key]
          const { default: def, required } = _props[key]
          if (_parentKey === SYMBOL_NONE) this.$props[key] = true
          else if (_parentKey in parentData) {
            this.$props[key] = parentData[_parentKey]
          } else if (typeof _parentKey === 'string') {
            this.$props[key] = _parentKey
          } else if (!required && 'default' in _props[key]) {
            this.$props[key] = def
          } else {
            /*@__PURE__*/ console.error(
              (() => {
                const parentMethods = parentComponent.$methods
                if (_parentKey in parentMethods) {
                  return `${this.localName}: 无法使用x-${key}将一个${parentComponent.localName}公开的方法绑定 。`
                } else if (required) {
                  return `${this.localName}: ${parentComponent.localName} 未赋予当前组件 ${key} 属性。`
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

      // Lifecycle: beforeCreate 调用时机
      runBeforeCreate()

      // 将setup中的数据分别放入$data和$methods中
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
        this.$methods[key] = (...args: any[]) => {
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
      else if (typeof template === 'function')
        shadow.innerHTML = template(this.$props)

      // 创建 style 标签
      if (style) {
        const styleEle = document.createElement('style')
        if (typeof style === 'string') styleEle.textContent = style
        else if (typeof style === 'function')
          styleEle.textContent = style(this.$props)
        shadow.appendChild(styleEle)
      }

      // 由于规定effect需要在组件创建开始，onMount 运行前就要创建，而目前使用setRunningSetup来限制在setup中运行
      // 所以这里需要先模拟为在setup内
      // 将非自定义组件的元素的动态属性与$data的值绑定
      Array.from(shadow.querySelectorAll('*'))
        .filter((ele) => !isCustomElement(ele.tagName.toLowerCase()))
        .map((ele) => {
          // 获取元素的属性
          const attrs = Array.from(ele.attributes)
          for (const attr of attrs) {
            const { name, value: key } = attr
            // if (reservedKeys.includes(name)) {
            //   continue
            // } else if (/^(on-)/.test(name)) {
            //   continue
            // } else
            if (/^(x-)/.test(name)) {
              if (!(key in this.$data)) {
                /*@__PURE__*/ console.warn(`${this.localName}: ${key} 未定义。`)
                continue
              }
              const val = this.$data[key]
              /*@__PURE__*/ checkValue(val, ele, key)

              if (isRef(val)) {
                effect(() => {
                  ele.setAttribute(name.slice(2), val.value.toString())
                })
              } else {
                ele.setAttribute(name.slice(2), val.toString())
              }

              ele.removeAttribute(name)
            }
          }
        })
      setRunningSetup(false)

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
        this.$defineExposes[exposeName] = ele.$exposeAttributes
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

      // 获取全部请求绑定事件的元素
      const eventEles = BaseElement.events.reduce(
        (acc, event) => {
          acc[event] = Array.from(
            shadow.querySelectorAll(`[on-${event}]`)
          ).filter((ele) => {
            const target = ele
            const targetTagName = target.tagName
            return !isCustomElement(targetTagName.toLowerCase())
          })
          return acc
        },
        // TODO: 这里的类型声明有问题: HTMLElement[]
        // 这里原来是HTMLElement[], 改成Element[], 不知道还有没有问题
        //                                                   ↓
        {} as Record<(typeof BaseElement.events)[number], Element[]>
      )

      // 绑定事件
      for (const event in eventEles) {
        eventEles[event as EventHandlers].forEach((ele) => {
          const target = ele
          const _fnName = target.getAttribute(`on-${event}`)
          if (!_fnName) return
          const [fn, ...args] = _fnName.split(',').map((str, index) => {
            const _str = str.trim()
            if (index === 0) {
              return this.$methods[_str]?.bind(this)
            }
            if (_str in this.$data) return this.$data[_str]
            else if (_str in this.$methods)
              return this.$methods[_str]?.bind(this)
            else return _str
          })
          if (!fn) {
            // TODO: 需要修改：如何判断是否是子组件的元素
            return /*@__PURE__*/ console.error(
              `${this.localName}: 未定义 ${_fnName} 方法。可能是因为请求绑定事件的元素 [${ele.localName}] 为当前组件的子组件内的元素，而子组件未启用 shadow。`
            )
          }
          target.addEventListener(event, (e: Event) => {
            fn(e, ...args)
          })
        })
      }

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

    remove() {
      if (this.$parentComponent) beforeRemove(this, this.$parentComponent)
      super.remove()
    }

    appendChild<T extends Node>(node: T): T {
      beforeAppend(node, this)
      return super.appendChild(node)
    }

    removeChild<T extends Node>(node: T): T {
      beforeRemove(node, this)
      return super.removeChild(node)
    }

    prepend(...nodes: (Node | string)[]) {
      nodes.forEach((node) => {
        if (typeof node !== 'string') {
          beforeAppend(node, this)
        }
      })
      return super.prepend(...nodes)
    }

    insertBefore<T extends Node>(newNode: T, referenceNode: Node | null): T {
      beforeAppend(newNode, this)
      return super.insertBefore(newNode, referenceNode)
    }

    replaceChild<T extends Node>(newNode: Node, oldNode: T): T {
      beforeRemove(oldNode, this)
      beforeAppend(newNode, this)
      return super.replaceChild(newNode, oldNode)
    }
  }

  return () => {
    customElementNameSet.add(name.toLowerCase())
    customElements.define(name, Ele, options)
  }
}

export default define

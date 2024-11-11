/* eslint-disable @typescript-eslint/no-explicit-any */
import { isReactive } from '../Dependency'
import { isRef, Ref } from '../ref'
import { type StopFn } from '../effect'
import { watch } from '../watch'
import { isArray } from '../utils/shared'
import BaseElement from './BaseElement'
import { isCustomElement, isReservedKey } from './defineElement'
import { Reactive } from 'xj-web-core/reactive'

// const eventCheck = /*#__PURE__*/ (
//   _key: EventHandlers,
//   value: (e: Event) => void
// ) => {
//   if (typeof value !== 'function') {
//     // console.error(`事件绑定必须是函数, 但得到了 ${typeof value} ${value}`)
//     return false
//   }
//   return true
// }

const setAttribute = (el: Element, key: string, value: any) => {
  if (value === null || value === undefined) {
    el.removeAttribute(key)
  } else {
    el.setAttribute(key, String(value))
  }
}

export type ChildType = string | Node | Ref<unknown> | Reactive<unknown[]>

const isXJElement = <T extends Element = Element>(
  el: any
): el is XJ.Element<T> => {
  return '__stopEffects__' in el && '__startEffects__' in el
}

const oldAppendChild = Element.prototype.appendChild

Element.prototype.appendChild = function <T extends Node>(node: T): T {
  const _ret = oldAppendChild.call<Element, [T], T>(this, node)
  if (isXJElement(node)) {
    node.__startEffects__()
  }
  return _ret
}

export const createElement = (
  tag: string,
  props?: { [key: string]: any },
  children?: ChildType[]
): Element => {
  // TODO: 使用模板字符串拼接dom字符串, 使用与否目前没有显著性能差异
  // if (
  //   Object.values(props ?? {}).every((val) => typeof val === 'string') &&
  //   children &&
  //   children.length <= 1 &&
  //   children.every((val) => typeof val === 'string')
  // ) {
  //   return `
  //     <${tag} ${Object.entries(props ?? {})
  //       .map(([key, val]) => `${key}="${val}"`)
  //       .join(' ')}
  //     >
  //       ${children.join('')}
  //     </${tag}>
  //   `
  // }

  const el = document.createElement(tag) as XJ.Element<HTMLElement>

  const isCustomEle = isCustomElement(el, tag)
  const component = el as XJ.Element<BaseElement>

  const EffectStops: Set<StopFn> = new Set()

  let isStop = true
  const childNodes = isCustomEle ? el.$root?.childNodes : el.childNodes

  const textNodeEffects = new Set<() => void>()
  const textNodeEffectsStops = new Set<StopFn>()

  el.__stopEffects__ = () => {
    if (isStop) return
    isStop = true
    EffectStops.forEach((stop) => stop())
    EffectStops.clear()

    textNodeEffectsStops.forEach((stop) => stop())
    textNodeEffectsStops.clear()

    childNodes.forEach((child) => {
      if (isXJElement(child)) {
        child.__stopEffects__()
      }
    })
  }

  el.__startEffects__ = () => {
    if (!isStop) return
    isStop = false

    // 自定义元素observe属性绑定
    // 原生元素响应式属性绑定
    for (const key in props) {
      if (isCustomEle) {
        if (el.obAttr.includes(key) && isRef<string>(props[key])) {
          const stop = watch(props[key], (value) => {
            setAttribute(el, key, value)
          })
          EffectStops.add(stop)
        }
      } else {
        if (!isReservedKey(key)) {
          if (key === 'class') {
            if (isReactive<string[]>(props[key])) {
              if (isArray<Reactive<string[]>>(props[key])) {
                if (!isReactive<string[]>(props[key])) return
                const stop = watch(
                  props[key],
                  (value) => {
                    el.className = value.join(' ')
                  },
                  { deep: 1 }
                )
                EffectStops.add(stop)
              }
            } else if (isRef(props[key])) {
              console.log('bgColorType.value', props[key].value)
              if (isArray<string[]>(props[key].value)) {
                const stop = watch(props[key], (value) => {
                  setAttribute(el, key, value)
                })
                EffectStops.add(stop)
              } else {
                const stop = watch(props[key] as Ref<string>, (value) => {
                  setAttribute(el, key, value)
                })
                EffectStops.add(stop)
              }
            }
          } else if (isRef(props[key])) {
            const stop = watch(props[key], (value) => {
              setAttribute(el, key, String(value))
            })
            EffectStops.add(stop)
          }
        }
      }
    }

    textNodeEffects.forEach((effect) => effect())

    childNodes.forEach((child) => {
      if (isXJElement(child)) {
        child.__startEffects__()
      }
    })
  }

  const elRemove = el.remove.bind(el)

  el.remove = () => {
    el.__stopEffects__()
    elRemove()
  }

  // 事件绑定
  // 自定义组件属性绑定
  // 原生组件静态属性绑定
  // ref和expose属性绑定
  for (const key in props) {
    // 处理事件绑定
    if (key.startsWith('on-')) {
      // /*#__PURE__*/ eventCheck(key.slice(3) as EventHandlers, props[key])
      const eventName = key.slice(3)
      // 对于自定义元素
      if (isCustomEle) {
        if (component) component.$emitMethods[eventName] = props[key]
      }
      // 对于原生元素
      else {
        el.addEventListener(eventName, props[key])
      }
    }
    // 处理属性绑定
    else {
      // 对于自定义元素
      if (isCustomEle) {
        // 对于保留属性 TODO: 目前是ref和expose。有修改需求时，需要修改此处
        if (isReservedKey(key)) {
          if (isRef(props[key])) {
            if (key === 'ref') {
              props[key].value = el
            } else if (key === 'expose') {
              props[key].value = el.$exposedData
            }
          } else {
            /*#__PURE__*/ console.error(
              `ref和expose属性只能是ref类型, 但得到了 ${typeof props[key]} ${props[key]}`
            )
          }
        }
        // 对于observe属性
        else if (el.obAttr.includes(key)) {
          if (!isRef(props[key])) {
            setAttribute(el, key, props[key])
          }
        }
        // 其他属性认为是prop声明的属性, 直接赋值
        else {
          component.$propData[key] = props[key]
        }
      }
      // 对于原生元素
      else {
        // 对于保留属性 TODO: 目前是ref和expose。有修改需求时，需要修改此处
        if (isReservedKey(key)) {
          if (isRef(props[key])) {
            if (key === 'ref') {
              props[key].value = el
            } else if (key === 'expose') {
              /*@__PURE__*/ console.error(
                `原生元素不支持expose属性, 请使用自定义元素`
              )
            }
          } else {
            /*#__PURE__*/ console.error(
              `ref和expose属性只能是ref类型, 但得到了 ${typeof props[key]} ${props[key]}`
            )
          }
        }
        // 对于class
        else if (key === 'class') {
          if (isArray<string[]>(props[key])) {
            if (!isReactive(props[key])) {
              el.className = props[key].join(' ')
            }
          } else {
            if (!isRef(props[key])) {
              setAttribute(el, key, props[key])
            }
          }
        } else if (!isRef(props[key])) {
          setAttribute(el, key, props[key])
        }
      }
    }
  }

  children?.forEach((child) => {
    if (child instanceof Node) {
      el.appendChild(child)
    } else {
      const childEl = (() => {
        if (isRef(child)) {
          const childEl = document.createTextNode(String(child.value))
          textNodeEffects.add(() => {
            textNodeEffectsStops.add(
              watch(
                child,
                (value) => {
                  childEl.nodeValue = String(value)
                },
                { deep: true }
              )
            )
          })
          return childEl
        }
        if (isReactive(child)) {
          const childEl = document.createTextNode(String(child))
          textNodeEffects.add(() => {
            textNodeEffectsStops.add(
              watch(
                child as Reactive<unknown[]>,
                (value) => {
                  childEl.nodeValue = String(value)
                },
                { deep: true }
              )
            )
          })
          return childEl
        }
        return document.createTextNode(String(child))
      })()

      el.appendChild(childEl)
    }
  })

  return el
}

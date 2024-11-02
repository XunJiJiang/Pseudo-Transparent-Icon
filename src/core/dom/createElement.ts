/* eslint-disable @typescript-eslint/no-explicit-any */
import { isReactive } from '../Dependency'
import { isRef } from '../ref'
import { type StopFn } from '../effect'
import { watch } from '../watch'
import { isArray } from '../utils/shared'
import BaseElement from './BaseElement'
import { isCustomElement, isReservedKey } from './defineElement'

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

export type ChildType = string | Node

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

  el.__stopEffects__ = () => {
    if (isStop) return
    isStop = true
    EffectStops.forEach((stop) => stop())
    EffectStops.clear()

    childNodes.forEach((child) => {
      if (isXJElement(child)) {
        child.__stopEffects__()
      }
    })
  }

  el.__startEffects__ = () => {
    if (!isStop) return
    isStop = false
    for (const key in props) {
      if (isCustomEle) {
        if (el.obAttr.includes(key) && isRef<string>(props[key])) {
          const stop = watch(
            props[key],
            (value) => {
              setAttribute(el, key, value)
            },
            {
              deep: true
            }
          )
          EffectStops.add(stop)
        }
      } else {
        if (!isReservedKey(key)) {
          if (key === 'class') {
            if (isArray<string>(props[key])) {
              if (isReactive(props[key])) {
                const stop = watch(
                  props[key],
                  (value) => {
                    el.className = value.join(' ')
                  },
                  {
                    deep: true
                  }
                )
                EffectStops.add(stop)
              } else if (isRef<string[]>(props[key])) {
                const stop = watch(
                  props[key],
                  (value) => {
                    el.className = value.join(' ')
                  },
                  {
                    deep: true
                  }
                )
                EffectStops.add(stop)
              }
            } else {
              if (isRef<string>(props[key])) {
                const stop = watch(
                  props[key],
                  (value) => {
                    setAttribute(el, key, value)
                  },
                  {
                    deep: true
                  }
                )
                EffectStops.add(stop)
              }
            }
          } else if (isRef(props[key])) {
            const stop = watch(
              props[key],
              (value) => {
                setAttribute(el, key, String(value))
              },
              {
                deep: true
              }
            )
            EffectStops.add(stop)
          }
        }
      }
    }
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
          // 值是ref, 监听ref的变化, 自动更新属性值
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
          if (isArray<string>(props[key])) {
            if (!isReactive(props[key])) {
              el.className = props[key].join(' ')
            }
          } else {
            if (!isRef(props[key])) {
              setAttribute(el, key, props[key])
            }
          }
        }
        // 值是ref, 监听ref的变化, 自动更新属性值
        else if (!isRef(props[key])) {
          setAttribute(el, key, props[key])
        }
      }
    }
  }

  children?.forEach((child) => {
    if (child instanceof Node) {
      el.appendChild(child)
    } else {
      el.appendChild(document.createTextNode(child))
    }
  })

  return el
}

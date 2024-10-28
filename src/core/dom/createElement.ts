/* eslint-disable @typescript-eslint/no-explicit-any */
import { effect, isRef, type StopFn } from '../Dependency'
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

// TODO: 重写remove appendChild等方法, 尽量不用FinalizationRegistry
// 仅重写remove, 同时不允许外部直接添加和删除元素

const setAttribute = (el: Element, key: string, value: any) => {
  if (value === null || value === undefined) {
    el.removeAttribute(key)
  } else {
    el.setAttribute(key, String(value))
  }
}

export type ChildType = string | Node

export const createElement = (
  tag: string,
  props?: { [key: string]: any },
  children?: ChildType[]
): Element => {
  const el = document.createElement(tag) as HTMLElement & {
    __stopEffects__: () => void
  }

  if (isArray(children)) {
    children.forEach((child) => {
      if (child instanceof Node) {
        el.appendChild(child)
      } else {
        el.appendChild(document.createTextNode(child))
      }
    })
  } else if (children) {
    el.appendChild(document.createTextNode(children))
  }

  const isCustomEle = isCustomElement(tag, el)
  const component = el as BaseElement & {
    __stopEffects__: () => void
  }

  const EffectStops: Set<StopFn> = new Set()

  el.__stopEffects__ = () => {
    EffectStops.forEach((stop) => stop())
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
          if (isRef(props[key])) {
            EffectStops.add(
              effect(
                () => {
                  setAttribute(el, key, props[key].value)
                },
                { flush: 'sync' }
              )
            )
          } else {
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
        // 值是ref, 监听ref的变化, 自动更新属性值
        else if (isRef(props[key])) {
          EffectStops.add(
            effect(
              () => {
                setAttribute(el, key, props[key].value)
              },
              { flush: 'sync' }
            )
          )
        } else {
          setAttribute(el, key, props[key])
        }
      }
    }
  }

  return el
}

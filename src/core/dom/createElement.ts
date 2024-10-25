/* eslint-disable @typescript-eslint/no-explicit-any */
import { isArray } from '../utils/shared'
import BaseElement from './BaseElement'
import { isCustomElement } from './defineElement'

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

export type ChildType = string | Node

export const createElement = (
  tag: string,
  props?: { [key: string]: any },
  children?: ChildType[]
): Element => {
  const el = document.createElement(tag)

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

  const isCustomEle = isCustomElement(tag)
  const component = el as BaseElement

  for (const key in props) {
    if (key.startsWith('on-')) {
      // /*#__PURE__*/ eventCheck(key.slice(3) as EventHandlers, props[key])
      const eventName = key.slice(3)
      if (isCustomEle) {
        if (component) component.$emitMethods[eventName] = props[key]
      } else el.addEventListener(eventName, props[key])
    } else {
      if (isCustomEle) {
        component.$propData[key] = props[key]
      }

      // console.log('key', key, props[key])
      el.setAttribute(key, String(props[key]))
    }
  }

  return el
}

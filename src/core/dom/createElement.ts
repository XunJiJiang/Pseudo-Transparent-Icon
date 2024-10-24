import { isArray } from '../utils/shared'

export const createElement = <T extends Node>(
  tag: string,
  opt?: { [key: string]: string },
  children?: T[] | string
): HTMLElement => {
  const el = document.createElement(tag)
  if (opt)
    for (const key in opt) {
      el.setAttribute(key, opt[key])
    }
  if (isArray(children)) {
    children.forEach((child) => {
      el.appendChild(child)
    })
  } else if (children) {
    el.appendChild(document.createTextNode(children))
  }
  return el
}

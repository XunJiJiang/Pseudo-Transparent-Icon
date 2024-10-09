export const isFunction = (
  fn: unknown
): fn is (...args: unknown[]) => unknown => typeof fn === 'function'

export const isArray = (arr: unknown): arr is unknown[] => Array.isArray(arr)

export const hasOwn = (
  val: object,
  key: string | symbol
): key is keyof typeof val => Object.prototype.hasOwnProperty.call(val, key)

export const isHTMLElement = (el: unknown): el is HTMLElement =>
  el instanceof HTMLElement

// /* eslint-disable @typescript-eslint/no-explicit-any */

export const isFunction = (
  fn: unknown
): fn is (...args: unknown[]) => unknown => typeof fn === 'function'

export const isArray = (arr: unknown): arr is unknown[] => Array.isArray(arr)

export const isObject = (val: unknown): val is object => {
  return val !== null && typeof val === 'object' && !Array.isArray(val)
}

export const hasOwn = <T extends object>(
  val: object,
  key: string | symbol
): val is T => Object.prototype.hasOwnProperty.call(val, key)

export const isHTMLElement = (el: unknown): el is HTMLElement =>
  el instanceof HTMLElement

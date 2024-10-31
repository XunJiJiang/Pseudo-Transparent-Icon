// /* eslint-disable @typescript-eslint/no-explicit-any */

export const isFunction = (
  fn: unknown
): fn is (...args: unknown[]) => unknown => typeof fn === 'function'

export const isArray = <T = unknown>(arr: unknown): arr is T[] =>
  Array.isArray(arr)

export const isObject = (val: unknown): val is object => {
  return val !== null && typeof val === 'object'
}

export const hasOwn = <T extends object>(
  val: object,
  key: string | symbol
): val is T => Object.prototype.hasOwnProperty.call(val, key)

export const isHTMLElement = (el: unknown): el is HTMLElement =>
  el instanceof HTMLElement

export const isPromise = <T = unknown>(val: unknown): val is Promise<T> =>
  (isObject(val) || isFunction(val)) && isFunction((val as Promise<T>).then)

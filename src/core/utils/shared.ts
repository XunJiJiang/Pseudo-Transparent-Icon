export const isFunction = (
  fn: unknown
): fn is (...args: unknown[]) => unknown => typeof fn === 'function'

export const isArray = (arr: unknown): arr is unknown[] => Array.isArray(arr)

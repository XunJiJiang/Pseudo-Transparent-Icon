export const isFunction = (
  fn: unknown
): fn is (...args: unknown[]) => unknown => typeof fn === 'function'

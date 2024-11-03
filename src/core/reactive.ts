import Dependency, { SYMBOL_DEPENDENCY } from './Dependency'
/**
 * TODO: 当传入的值是dep实例时，是直接返回还是根据dep实例的值返回一个新的dep实例？
 */

export type Reactive<T extends object> = {
  [key in keyof T]: T[key] extends object ? Reactive<T[key]> : T[key]
} & {
  [SYMBOL_DEPENDENCY]: Dependency<T>
}

export const reactive = <T extends object>(obj: T): Reactive<T> => {
  const dep = new Dependency(obj)

  return dep.value as Reactive<T>
}

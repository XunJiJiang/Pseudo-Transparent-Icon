import Dependency from './Dependency'
/**
 * TODO: 当传入的值是dep实例时，是直接返回还是根据dep实例的值返回一个新的dep实例？
 */

export const reactive = <T extends object>(obj: T): T => {
  const dep = new Dependency(obj)

  return dep.value as T
}

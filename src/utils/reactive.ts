import Dependency from './Dependency'

const reactive = <T extends object>(obj: T): T => {
  const dep = new Dependency(obj)

  return dep.value as T
}

export default reactive

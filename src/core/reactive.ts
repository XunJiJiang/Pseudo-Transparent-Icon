import Dependency from './Dependency'
import { getCurrentComponent } from './fixComponentIns'

const reactive = <T extends object>(obj: T): T => {
  const currentComponent = getCurrentComponent()
  const dep = new Dependency(obj, currentComponent)

  return dep.value as T
}

export default reactive

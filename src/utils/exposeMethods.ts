import { Func } from '@type/function'
import { getCurrentComponent } from './fixComponentIns'

export const exposeMethods = (methods: Record<string, Func>) => {
  const currentComponent = getCurrentComponent()
  if (currentComponent) {
    currentComponent.$exposeMethods = methods
  }
}

export default exposeMethods

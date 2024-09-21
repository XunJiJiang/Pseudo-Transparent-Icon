import { Func } from '@type/function'
import { getCurrentComponent } from './fixComponentIns'

export const exposeAttributes = (methods: Record<string, Func>) => {
  const currentComponent = getCurrentComponent()
  if (currentComponent) {
    currentComponent.$exposeAttributes = methods
  }
}

export default exposeAttributes

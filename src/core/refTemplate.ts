import { getCurrentComponent } from './fixComponentIns'
import { getRunningSetup } from './hooks/lifecycle/verifySetup'

const refTemplate = <T extends HTMLElement = HTMLElement>(refKey: string) => {
  const currentComponent = getCurrentComponent()
  if (!getRunningSetup() || !currentComponent) {
    throw new Error('refTemplate 必须在 setup 函数中使用。')
  }
  const _ref = {
    value: null
  } as {
    value: T | null
  }
  currentComponent.$refs[refKey] = _ref
  return _ref
}

export default refTemplate

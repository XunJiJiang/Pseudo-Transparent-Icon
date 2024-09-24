import { getCurrentComponent } from './fixComponentIns'

const refTemplate = <T extends HTMLElement = HTMLElement>(refKey: string) => {
  const currentComponent = getCurrentComponent()
  if (currentComponent) {
    const _ref = {
      value: null
    } as {
      value: T | null
    }
    currentComponent.$refs[refKey] = _ref
    return _ref
  }

  throw new Error('refTemplate 必须在 setup 函数中使用。')
}

export default refTemplate

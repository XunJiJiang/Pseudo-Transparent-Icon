import { getCurrentComponent } from './fixComponentIns'
import ref from './ref'

const refTemplate = <T extends HTMLElement = HTMLElement>(refKey: string) => {
  const currentComponent = getCurrentComponent()
  if (currentComponent) {
    const _ref = ref<T>(null)
    currentComponent.$refs[refKey] = _ref
    return _ref
  }

  throw new Error('refTemplate 必须在 setup 函数中使用。')
}

export default refTemplate

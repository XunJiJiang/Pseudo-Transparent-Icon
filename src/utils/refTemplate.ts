import BaseElement from './BaseElement'
import ref from './ref'

let currentComponent: BaseElement | null = null

// 修改正在实例化的组件
export const setComponentIns = (instance: BaseElement | null) => {
  currentComponent = instance
}

const refTemplate = <T extends HTMLElement = HTMLElement>(refKey: string) => {
  if (currentComponent) {
    const _ref = ref<T>(null)
    currentComponent.$refs[refKey] = _ref
    return _ref
  }

  throw new Error('refTemplate 必须在 setup 函数中使用。')
}

export default refTemplate

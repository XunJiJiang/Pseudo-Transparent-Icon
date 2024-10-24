import { getCurrentComponent, setComponentIns } from './fixComponentIns'
import { isFunction } from '../utils/shared'

export const exposeAttributes = (attrs: Record<string, unknown>) => {
  const currentComponent = getCurrentComponent()
  if (currentComponent) {
    for (const key in attrs) {
      if (key in currentComponent.$exposeAttributes) {
        /*@__PURE__*/ console.warn(
          `${currentComponent.localName} 重复暴露 ${key} 属性，旧的值将被覆盖。`
        )
      }
      const _val = attrs[key]
      if (isFunction(_val)) {
        currentComponent.$exposeAttributes[key] = (
          ...args: Parameters<typeof _val>
        ) => {
          const { restore } = setComponentIns(currentComponent)
          const _return = _val.call(currentComponent, ...args)
          restore()
          return _return
        }
      } else {
        currentComponent.$exposeAttributes[key] = _val
      }
    }
  }
}

export default exposeAttributes

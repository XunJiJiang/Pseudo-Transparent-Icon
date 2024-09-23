import { getCurrentComponent, setComponentIns } from './fixComponentIns'
import { isFunction } from './utils/shared'

export const exposeAttributes = (attrs: Record<string, unknown>) => {
  const currentComponent = getCurrentComponent()
  if (currentComponent) {
    for (const key in attrs) {
      if (key in currentComponent.$exposeAttributes) {
        ;(() => {
          console.error(`${currentComponent.localName} 重复暴露 ${key} 属性。`)
        })()
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
  /*@__PURE__*/ console.error(
    'exposeAttributes: 当前组件实例不存在, 可能是由于错误的调用时机。'
  )
}

export default exposeAttributes

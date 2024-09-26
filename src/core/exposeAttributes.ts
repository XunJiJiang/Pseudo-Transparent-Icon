import BaseElement from './BaseElement'
import { getCurrentComponent, setComponentIns } from './fixComponentIns'
import { isFunction } from './utils/shared'

const exposeMap = new Map<BaseElement, Record<string, unknown>>()

export const getExposeAttributes = (component: BaseElement) => {
  const expose = exposeMap.get(component)
  if (expose) {
    return expose
  } else {
    /*@__PURE__*/ console.error(`组件 ${component.localName} 未暴露任何属性。`)
    return {}
  }
}

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
    exposeMap.set(currentComponent, currentComponent.$exposeAttributes)
  }
}

export default exposeAttributes

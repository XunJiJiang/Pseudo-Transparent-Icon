import BaseElement from './BaseElement'

/** 组件实例树, 不包括当前实例 */
const componentInsTree: BaseElement[] = []

let currentComponent: BaseElement | null = null

// 修改正在实例化的组件
export const setComponentIns = (instance: BaseElement | null) => {
  if (instance) {
    if (currentComponent) componentInsTree.push(currentComponent)
    currentComponent = instance
  } else {
    if (componentInsTree.length) {
      currentComponent = componentInsTree.pop()!
    } else {
      currentComponent = null
    }
  }
}

/** 表现: 当一个函数只能在setup中使用时, 可以通过该函数获取实例 */
export const getCurrentComponent = () => {
  return (
    currentComponent ??
    (() => {
      throw new Error('该函数只能在setup中使用')
    })()
  )
}

export const getParentComponent = (): BaseElement | null => {
  return componentInsTree[componentInsTree.length - 1] || null
}

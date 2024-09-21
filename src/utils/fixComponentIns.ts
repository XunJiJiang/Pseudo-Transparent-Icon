import BaseElement from './BaseElement'

// INFO: 可能并不是符合dom树的实例, 有待验证, 不过对于目前的使用场景来说, 可以满足需求
/** 组件实例调用树, 不包括当前实例 */
const componentInsTree: BaseElement[] = []

// 当前实例
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
  return currentComponent ?? null
}

/** 用于在setup暴露的方法和effect依赖的副作用函数获取有类型声明的实例 */
export const getInstance = () => {
  /*@__PURE__*/ ;(() => {
    if (!currentComponent) {
      throw new Error('当前组件实例不存在, 可能是由于错误的调用时机。')
    }
  })()

  return currentComponent as BaseElement
}

// export const getParentComponent = (): BaseElement | null => {
//   return componentInsTree[componentInsTree.length - 1] || null
// }

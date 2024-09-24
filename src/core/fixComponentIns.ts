import BaseElement from './BaseElement'

// 当前实例
let currentComponent: BaseElement | null = null

// 修改正在实例化的组件
export const setComponentIns = (instance: BaseElement) => {
  let restoreRun = false
  const old = currentComponent
  currentComponent = instance

  return {
    restore() {
      currentComponent = old
      restoreRun = true
    },
    get old() {
      if (!restoreRun) {
        return old
      }
      /*@__PURE__*/ console.error('setComponentIns: restore has been run')
      return null
    }
  }
}

/** 表现: 当一个函数只能在setup中使用时, 可以通过该函数获取实例 */
export const getCurrentComponent = () => {
  return currentComponent ?? null
}

/** 用于在setup暴露的方法和effect依赖的副作用函数内获取有类型声明的实例 */
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

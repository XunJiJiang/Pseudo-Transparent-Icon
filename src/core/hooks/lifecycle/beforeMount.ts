import BaseElement from 'xj-web-core/BaseElement'
import {
  type LifecycleFn,
  type LifecycleCallback,
  getRunningSetup
} from './verifySetup'

// onBeforeMount在setup函数中调用
// setup结束后，构造器调用前执行runBeforeMount
// 此时同步函数未执行完毕，而callbackSet已经清空
// 因此可以复用callbackSet

const callbackSet = new Set<LifecycleCallback>()

export const onBeforeMount: LifecycleFn = (callback) => {
  if (!getRunningSetup()) {
    return /*@__PURE__*/ console.error('onBeforeMount 必须在 setup 函数中调用')
  }
  callbackSet.add(callback)
}

// 同理，可以复用
// 注意: onBeforeMount的清理函数clearFnMap不是同步执行的，不能复用

const clearFnMap = new WeakMap<BaseElement, Set<() => void>>()

export const runBeforeMount = (ele: BaseElement) => {
  callbackSet.forEach((cb) => {
    const clearFn = cb()
    if (clearFn) {
      if (!clearFnMap.has(ele)) {
        clearFnMap.set(ele, new Set())
      }
      clearFnMap.get(ele)!.add(clearFn)
    }
  })
  callbackSet.clear()
}

export const clearBeforeMount = (ele: BaseElement) => {
  if (clearFnMap.has(ele)) {
    clearFnMap.get(ele)!.forEach((fn) => fn())
    clearFnMap.delete(ele)
  }
}

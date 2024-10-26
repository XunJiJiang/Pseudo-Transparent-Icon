import BaseElement from '../../dom/BaseElement'
import {
  type LifecycleFn,
  type LifecycleCallback,
  hasSetupRunning
} from './verifySetup'
import { getCurrentComponent } from '../../dom/fixComponentIns'

// onBeforeCreate在setup函数中调用
// setup结束后，构造器调用前执行runBeforeCreate
// 此时同步函数未执行完毕，而callbackSet已经清空
// 因此可以复用callbackSet

const callbackMap = new WeakMap<BaseElement, Set<LifecycleCallback>>()

export const onBeforeCreate: LifecycleFn = (callback) => {
  if (!hasSetupRunning()) {
    return /*@__PURE__*/ console.error('onBeforeCreate 必须在 setup 函数中调用')
  }
  const ele = getCurrentComponent()
  if (!ele) {
    return /*@__PURE__*/ console.error('onMounted 必须在 setup 函数中调用')
  }
  if (!callbackMap.has(ele)) {
    callbackMap.set(ele, new Set())
  }
  callbackMap.get(ele)!.add(callback)
}

// 同理，可以复用

const clearFnMap = new WeakMap<BaseElement, Set<() => void>>()

export const runBeforeCreate = (ele: BaseElement) => {
  const callbackSet = callbackMap.get(ele)
  callbackSet?.forEach((cb) => {
    const clearFn = cb()
    if (clearFn) {
      if (!clearFnMap.has(ele)) {
        clearFnMap.set(ele, new Set())
      }
      clearFnMap.get(ele)!.add(clearFn)
    }
  })
  callbackSet?.clear()
}

export const clearBeforeCreate = (ele: BaseElement) => {
  if (clearFnMap.has(ele)) {
    clearFnMap.get(ele)!.forEach((fn) => fn())
    clearFnMap.delete(ele)
  }
}

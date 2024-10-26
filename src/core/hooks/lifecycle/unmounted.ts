import BaseElement from '../../dom/BaseElement'
import {
  type LifecycleFn,
  type LifecycleCallback,
  hasSetupRunning
} from './verifySetup'
import { getCurrentComponent } from '../../dom/fixComponentIns'

const callbackMap = new WeakMap<BaseElement, Set<LifecycleCallback>>()

export const onUnmounted: LifecycleFn = (callback) => {
  if (!hasSetupRunning()) {
    return /*@__PURE__*/ console.error('onUnmounted 必须在 setup 函数中调用')
  }
  const ele = getCurrentComponent()
  if (!ele) {
    return /*@__PURE__*/ console.error('onUnmounted 必须在 setup 函数中调用')
  }
  if (!callbackMap.has(ele)) {
    callbackMap.set(ele, new Set())
  }
  callbackMap.get(ele)!.add(callback)
}

export const runUnmounted = (ele: BaseElement) => {
  if (!ele) {
    /*@__PURE__*/ throw new Error(`runUnMounted: 当前组件实例不存在`)
  }
  const callbackSet = callbackMap.get(ele)
  callbackSet?.forEach((cb) => cb())
  callbackSet?.clear()
  callbackMap.delete(ele)
}

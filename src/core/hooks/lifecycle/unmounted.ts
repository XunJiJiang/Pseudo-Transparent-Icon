import BaseElement from 'xj-web-core/BaseElement'
import {
  type LifecycleFn,
  type LifecycleCallback,
  getRunningSetup
} from './verifySetup'
import { getCurrentComponent } from 'xj-web-core/fixComponentIns'

const callbackMap = new WeakMap<BaseElement, Set<LifecycleCallback>>()

export const unmounted: LifecycleFn = (callback) => {
  if (!getRunningSetup()) {
    return /*@__PURE__*/ console.error('unmounted 必须在 setup 函数中调用')
  }
  const ele = getCurrentComponent()
  if (!ele) {
    return /*@__PURE__*/ console.error('unmounted 必须在 setup 函数中调用')
  }
  if (!callbackMap.has(ele)) {
    callbackMap.set(ele, new Set())
  }
  callbackMap.get(ele)!.add(callback)
}

export const runUnmounted = () => {
  const ele = getCurrentComponent()
  if (!ele) {
    /*@__PURE__*/ throw new Error(`runUnMounted: 当前组件实例不存在`)
  }
  const callbackSet = callbackMap.get(ele)
  callbackSet?.forEach((cb) => cb())
  callbackSet?.clear()
  callbackMap.delete(ele)
}

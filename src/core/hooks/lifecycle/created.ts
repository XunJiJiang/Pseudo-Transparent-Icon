import {
  type LifecycleFn,
  type LifecycleCallback,
  getRunningSetup
} from './verifySetup'

// onCreated在setup函数中调用
// setup结束后，构造器调用前执行runCreated
// 此时同步函数未执行完毕，而callbackSet已经清空
// 因此可以复用callbackSet

const callbackSet = new Set<LifecycleCallback>()

export const onCreated: LifecycleFn = (callback) => {
  if (!getRunningSetup()) {
    return /*@__PURE__*/ console.error('onCreated 必须在 setup 函数中调用')
  }
  callbackSet.add(callback)
}

// 同理，可以复用

const clearFnSet = new Set<() => void>()

export const runCreated = () => {
  callbackSet.forEach((cb) => {
    const clearFn = cb()
    if (clearFn) {
      clearFnSet.add(clearFn)
    }
  })
  callbackSet.clear()
}

export const clearCreated = () => {
  clearFnSet.forEach((cb) => cb())
  clearFnSet.clear()
}

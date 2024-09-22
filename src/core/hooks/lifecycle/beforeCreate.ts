import {
  type LifecycleFn,
  type LifecycleCallback,
  getRunningSetup
} from './verifySetup'

// beforeCreate在setup函数中调用
// setup结束后，构造器调用前执行runBeforeCreate
// 此时同步函数未执行完毕，而callbackSet已经清空
// 因此可以复用callbackSet

const callbackSet = new Set<LifecycleCallback>()

export const beforeCreate: LifecycleFn = (callback) => {
  if (!getRunningSetup()) {
    return /*@__PURE__*/ console.error('beforeCreate 必须在 setup 函数中调用')
  }
  callbackSet.add(callback)
}

// 同理，可以复用

const clearFnSet = new Set<() => void>()

export const runBeforeCreate = () => {
  callbackSet.forEach((cb) => {
    const clearFn = cb()
    if (clearFn) {
      clearFnSet.add(clearFn)
    }
  })
  callbackSet.clear()
}

export const clearBeforeCreate = () => {
  clearFnSet.forEach((cb) => cb())
  clearFnSet.clear()
}

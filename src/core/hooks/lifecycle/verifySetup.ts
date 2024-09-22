// 设计: 每一个生命周期函数获取的副作用函数的垃圾清理函数都会在下一个生命周期函数执行之前执行
// 最后一个生命周期没有下一个生命周期，没有垃圾清理函数

export type LifecycleCallback<T extends (() => void) | void = () => void> =
  () => T | void

export interface LifecycleFn<T extends (() => void) | void = () => void> {
  (callback: LifecycleCallback<T>): void
}

// 记录是否在运行 setup 函数
let isRunningSetup = false

// 修改 setup 函数的运行状态
export const setRunningSetup = (val: boolean) => {
  isRunningSetup = val
}

// 获取 setup 函数的运行状态
export const getRunningSetup = () => isRunningSetup

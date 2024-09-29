/**
 * Dependency class
 * 创建一个依赖项
 */

import { Func } from '@/types/function'
import BaseElement from './BaseElement'
import { setComponentIns, getCurrentComponent } from './fixComponentIns'
import { onMounted } from './hooks/lifecycle/mounted'
import AutoAsyncTask from './utils/AutoAsyncTask'
import { isArray } from './utils/shared'

export type EffectCallback = () => (() => void) | void

let currentEffectFn: EffectCallback | null = null

export const effect = (effCallback: EffectCallback) => {
  onMounted(() => {
    const ele = getCurrentComponent()
    if (!ele) {
      return /*@__PURE__*/ console.error('effect 必须在 setup 函数中调用')
    }
    const effect = () => {
      const { restore } = setComponentIns(ele)
      const _ret = effCallback()
      restore()
      return _ret
    }
    currentEffectFn = effect
    const cb = effect() ?? null
    cb?.()
    currentEffectFn = null
  })
}

const SYMBOL_EFFECT = Symbol('effect')

/*concat()
slice()
map()
filter()
reduce()
find()
findIndex()
every()
some()
includes()
join() */

// 函数上非纯函数的属性
const notPureArrFuncKey = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse',
  'copyWithin',
  'fill'
]

class Dependency<T extends object> {
  private _deps = new Map<string | symbol, Set<EffectCallback>>()
  private _depCleanups = new Map<string | symbol, Set<() => void>>()
  private _value: object
  private _currentComponent: BaseElement | null
  private _proxy: ProxyHandler<T>

  private _isProxy: Array<string | symbol> = []

  constructor(value: T, currentComponent: BaseElement | null) {
    this._value = value
    this._currentComponent = currentComponent

    this._proxy = new Proxy(this._value, {
      get: (target, key, receiver) => {
        const collect = this.collect.bind(this)
        const cleanup = this.cleanup.bind(this)
        const distribute = this.distribute.bind(this)
        const _value = Reflect.get(target, key, receiver)
        let _ret = _value
        if (typeof _value === 'object' && !this._isProxy.includes(key)) {
          const newDep = new Dependency(_value, this._currentComponent)
          Reflect.set(target, key, newDep.value, receiver)
          _ret = newDep.value
          this._isProxy.push(key)
        }

        if (
          typeof _value === 'function' &&
          isArray(target) &&
          notPureArrFuncKey.includes(key as string)
        ) {
          return function (...args: Parameters<typeof _value>) {
            // 调用原始方法
            cleanup()
            const result = _value.apply(target, args)
            distribute()
            return result
          }
        }

        if (isArray(target)) collect()
        else collect(key)
        return _ret
      },
      set: (target, key, value, receiver) => {
        if (isArray(target)) this.cleanup()
        else this.cleanup(key)
        const _ret = Reflect.set(target, key, value, receiver)
        if (isArray(target)) this.distribute()
        else this.distribute(key)
        return _ret
      }
    })
  }

  private collect(key: string | symbol = SYMBOL_EFFECT) {
    if (currentEffectFn) {
      const _dep =
        this._deps.get(key) ?? this._deps.set(key, new Set()).get(key)
      _dep!.add(currentEffectFn)
      // TODO: 先收集依赖
      // 收集完成后立刻运行清理函数
      // 再异步发布任务
      // 这样可以保证清理函数在发布任务之前运行
      // 但会导致在收集依赖时期会运行两次副作用函数
      // 有待优化
      AutoAsyncTask.addTask(() => {
        this.distribute(key)
      }, this.distribute as Func)
    }
  }

  private cleanup(key: string | symbol = SYMBOL_EFFECT) {
    const { restore } = this._currentComponent
      ? setComponentIns(this._currentComponent)
      : { restore: () => {} }
    const _depCleanup =
      this._depCleanups.get(key) ??
      this._depCleanups.set(key, new Set()).get(key)
    _depCleanup!.forEach((cleanup, _, set) => {
      AutoAsyncTask.addTask(cleanup, cleanup)
      set.delete(cleanup)
    })
    restore()
  }

  private distribute(key: string | symbol = SYMBOL_EFFECT) {
    const { restore } = this._currentComponent
      ? setComponentIns(this._currentComponent)
      : { restore: () => {} }
    const _depCleanup =
      this._depCleanups.get(key) ??
      this._depCleanups.set(key, new Set()).get(key)
    const _dep = this._deps.get(key) ?? this._deps.set(key, new Set()).get(key)
    _dep!.forEach((dep) => {
      AutoAsyncTask.addTask(() => {
        const _return = dep()
        if (_return) {
          _depCleanup!.add(_return)
        }
      }, dep)
    })
    restore()
  }

  get value() {
    return this._proxy
  }
}

export default Dependency

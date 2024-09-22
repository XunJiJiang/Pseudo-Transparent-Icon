/**
 * Dependency class
 * 创建一个依赖项
 */

import BaseElement from './BaseElement'
import { setComponentIns, getCurrentComponent } from './fixComponentIns'
import { mounted } from './hooks/lifecycle/mounted'
import AsyncTaskQueue from './utils/asyncTaskQueue'

export type EffectCallback = () => (() => void) | void

let currentEffectFn: EffectCallback | null = null

let currentEffectFnReturn: (() => void) | null = null

export const useEffect = (effCallback: EffectCallback) => {
  mounted(() => {
    const ele = getCurrentComponent()
    if (!ele) {
      return /*@__PURE__*/ console.error('effect 必须在 setup 函数中调用')
    }
    const effect = () => {
      const parentComponent = getCurrentComponent()
      setComponentIns(ele)
      const _ret = effCallback()
      setComponentIns(parentComponent)
      return _ret
    }
    currentEffectFn = effect
    currentEffectFnReturn = effect() ?? null
    currentEffectFn = null
    currentEffectFnReturn = null
  })
}

class Dependency<T extends object> {
  private _deps = new Map<string | symbol, Set<EffectCallback>>()
  private _depCleanups = new Map<string | symbol, Set<() => void>>()
  private _distributeTask = new AsyncTaskQueue()
  private _value: object
  private _currentComponent: BaseElement | null
  private _proxy: ProxyHandler<T>

  private _isProxy: Array<string | symbol> = []

  constructor(value: T, currentComponent: BaseElement | null) {
    this._value = value
    this._currentComponent = currentComponent

    this._proxy = new Proxy(this._value, {
      get: (target, key, receiver) => {
        const _value = Reflect.get(target, key, receiver)
        let _ret = _value
        if (typeof _value === 'object' && !this._isProxy.includes(key)) {
          const newDep = new Dependency(_value, this._currentComponent)
          Reflect.set(target, key, newDep.value, receiver)
          _ret = newDep.value
          this._isProxy.push(key)
        }
        this.collect(key)
        return _ret
      },
      set: (target, key, value, receiver) => {
        const _ret = Reflect.set(target, key, value, receiver)
        this.distribute(key)
        return _ret
      }
    })
  }

  private collect(key: string | symbol) {
    if (currentEffectFnReturn) {
      const _depCleanup =
        this._depCleanups.get(key) ??
        this._depCleanups.set(key, new Set()).get(key)
      _depCleanup!.add(currentEffectFnReturn)
    }
    if (currentEffectFn) {
      const _dep =
        this._deps.get(key) ?? this._deps.set(key, new Set()).get(key)
      _dep!.add(currentEffectFn)
    }
  }

  private distribute(key: string | symbol) {
    const parentComponent = getCurrentComponent()
    setComponentIns(this._currentComponent)
    const _depCleanup =
      this._depCleanups.get(key) ??
      this._depCleanups.set(key, new Set()).get(key)
    _depCleanup!.forEach((cleanup) => {
      this._distributeTask.addTask(cleanup)
    })
    _depCleanup!.clear()
    const _dep = this._deps.get(key) ?? this._deps.set(key, new Set()).get(key)
    _dep!.forEach((dep) => {
      this._distributeTask.addTask(() => {
        const _return = dep()
        if (_return) {
          _depCleanup!.add(_return)
        }
      }, dep)
    })
    this._distributeTask.runOnce()
    setComponentIns(parentComponent)
  }

  get value() {
    return this._proxy
  }
}

export default Dependency

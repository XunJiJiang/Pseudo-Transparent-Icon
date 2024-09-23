/**
 * Dependency class
 * 创建一个依赖项
 */

import { Func } from '@/types/function'
import BaseElement from './BaseElement'
import { setComponentIns, getCurrentComponent } from './fixComponentIns'
import { mounted } from './hooks/lifecycle/mounted'
import AutoAsyncTask from './utils/AutoAsyncTask'

export type EffectCallback = () => (() => void) | void

let currentEffectFn: EffectCallback | null = null

export const effect = (effCallback: EffectCallback) => {
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
    const cb = effect() ?? null
    cb?.()
    currentEffectFn = null
  })
}

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
        this.cleanup(key)
        const _ret = Reflect.set(target, key, value, receiver)
        this.distribute(key)
        return _ret
      }
    })
  }

  private collect(key: string | symbol) {
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

  private cleanup(key: string | symbol) {
    const parentComponent = getCurrentComponent()
    setComponentIns(this._currentComponent)
    const _depCleanup =
      this._depCleanups.get(key) ??
      this._depCleanups.set(key, new Set()).get(key)
    _depCleanup!.forEach((cleanup, _, set) => {
      AutoAsyncTask.addTask(cleanup, cleanup)
      set.delete(cleanup)
    })
    setComponentIns(parentComponent)
  }

  private distribute(key: string | symbol) {
    const parentComponent = getCurrentComponent()
    setComponentIns(this._currentComponent)
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
    setComponentIns(parentComponent)
  }

  get value() {
    return this._proxy
  }
}

export default Dependency

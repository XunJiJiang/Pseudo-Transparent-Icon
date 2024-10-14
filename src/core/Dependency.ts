/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Dependency class
 * 创建一个依赖项
 */

import BaseElement from './BaseElement'
import { setComponentIns, getCurrentComponent } from './fixComponentIns'
import { onMounted } from './hooks/lifecycle/mounted'
import AutoAsyncTask from './utils/AutoAsyncTask'
import { isArray, isObject } from './utils/shared'

export type EffectCallback = () => (() => void) | void

type DepCleanupSet = WeakSet<() => void>

type DepCleanupSets = Set<DepCleanupSet>

let currentEffectFn: EffectCallback | null = null

/** 记录effect和对应的元素实例 */
const effectEleMap = new WeakMap<EffectCallback, BaseElement>()

/** 记录当前运行的effect的依赖对应的清理函数集 */
const effectDepCleanupMap = new WeakMap<EffectCallback, DepCleanupSets>()

/** effect和对应的封装函数 */
// const effectEncapsulationMap = new WeakMap<EffectCallback, EffectCallback>()

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
    effectEleMap.set(effect, ele)
    currentEffectFn = effect
    const cleanupSets = new Set<WeakSet<() => void>>()
    effectDepCleanupMap.set(effect, cleanupSets)
    const cb = effect() ?? null
    if (cb) {
      cleanupSets.forEach((depEle) => {
        depEle.add(cb)
      })
      depCleanupMap.set(cb, cleanupSets)
    }
    effectDepCleanupMap.delete(effect)
    currentEffectFn = null
  })
}

// setInterval(() => {
//   console.log('effectDepCleanupMap', effectDepCleanupMap)
//   console.log('effectDepMap', effectDepMap)
//   console.log('depCleanupMap', depCleanupMap)
//   console.log('effectEleMap', effectEleMap)
// }, 5000)

/** 无key的依赖key */
const SYMBOL_EFFECT = Symbol('effect')
/** 被代理标志 */
const SYMBOL_DEPENDENCY = Symbol('dependency')

/** 函数上非纯函数的属性 */
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

export const isRef = <T = any>(
  val: unknown
): val is Dependency<{
  value: T
}> => {
  return isReactive<{
    value: T
  }>(val)
}

const hasSYMBOL_DEPENDENCY = (
  val: object
): val is { [key in typeof SYMBOL_DEPENDENCY]: Dependency<object> } => {
  return (
    (val as { [key in typeof SYMBOL_DEPENDENCY]: Dependency<object> })[
      SYMBOL_DEPENDENCY
    ] !== undefined
  )
}

export const isReactive = <T extends object = Record<string | symbol, any>>(
  val: unknown
): val is Dependency<T> => {
  return (
    isObject(val) &&
    hasSYMBOL_DEPENDENCY(val) &&
    val[SYMBOL_DEPENDENCY] instanceof Dependency
  )
}

// 只要一个distribute尝试把运行某个effect加入AutoAsyncTask, 就将这个effect和此次对应的_depCleanups对应
// 当EffectCallback真正运行时，会将其返回值加入全部记录的_depCleanups
// 这样，不管是哪个dep触发了distribute，都会将当前effect的清理函数加入全部记录的_depCleanups
// effect的清理函数唯一，且在任意dep触发cleanup时运行
const effectDepMap = new WeakMap<EffectCallback, DepCleanupSets>()

// 记录单个清理函数和对应的_depCleanups
const depCleanupMap = new WeakMap<() => void, DepCleanupSets>()

class Dependency<T extends object> {
  private _deps = new Map<string | symbol, Set<EffectCallback>>()
  private _depCleanups = new Map<string | symbol, Set<() => void>>()
  private _value: object
  private _proxy: ProxyHandler<T>

  private _isProxy: Array<string | symbol> = []

  constructor(value: T, baseKey = '') {
    this._value = value
    this.baseKey = baseKey

    this._proxy = new Proxy(this._value, {
      get: (target, key, receiver) => {
        if (key === SYMBOL_DEPENDENCY) return this
        // if (!Reflect.has(target, key)) {
        // }
        const collect = this.collect.bind(this)
        const cleanup = this.cleanup.bind(this)
        const distribute = this.distribute.bind(this)
        const _value = Reflect.get(target, key, receiver)
        let _ret = _value
        if (
          isObject(_value) &&
          !this._isProxy.includes(this.baseKey + String(key))
        ) {
          const newDep = new Dependency(_value, this.baseKey + String(key))
          Reflect.set(target, key, newDep.value, receiver)
          _ret = newDep.value
          this._isProxy.push(this.baseKey + String(key))
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
        else collect(this.baseKey + String(key))
        return _ret
      },
      set: (target, key, value, receiver) => {
        if (isArray(target)) this.cleanup()
        else this.cleanup(this.baseKey + String(key))
        if (isArray(target)) this.distribute()
        else this.distribute(this.baseKey + String(key))
        return Reflect.set(target, key, value, receiver)
      }
    })
  }

  private baseKey = ''

  private collect(key: string | symbol = SYMBOL_EFFECT) {
    if (currentEffectFn) {
      const ele = effectEleMap.get(currentEffectFn)
      if (!ele) {
        return /*@__PURE__*/ console.error('effect 必须在 setup 函数中调用')
      }
      const _dep =
        this._deps.get(key) ?? this._deps.set(key, new Set()).get(key)!
      _dep.add(currentEffectFn)
      // 设置\获取当前effect的清理函数
      const _depCleanup =
        this._depCleanups.get(key) ??
        this._depCleanups.set(key, new Set()).get(key)!
      const effectDepCleanups =
        effectDepMap.get(currentEffectFn) ??
        effectDepMap.set(currentEffectFn, new Set()).get(currentEffectFn)!
      // 为当前effect添加对应dep的清理函数集合
      effectDepCleanups.add(_depCleanup)
      const cleanupSets = effectDepCleanupMap.get(currentEffectFn)
      cleanupSets?.add(_depCleanup)

      const eleDestroy = ele.__destroy__.bind(ele)
      const effectFn = currentEffectFn
      ele.__destroy__ = (symbol: Parameters<typeof eleDestroy>[0]) => {
        if (!eleDestroy(symbol)) {
          return false
        }
        _dep.delete(effectFn)
        if (effectEleMap.get(effectFn) === ele) {
          effectEleMap.delete(effectFn)
        }
        effectDepMap.delete(effectFn)
        depCleanupMap.delete(effectFn)
        effectDepCleanups.delete(_depCleanup)
        cleanupSets?.delete(_depCleanup)
        return true
      }
    }
  }

  private cleanup(key: string | symbol = SYMBOL_EFFECT) {
    const _depCleanup =
      this._depCleanups.get(key) ??
      this._depCleanups.set(key, new Set()).get(key)
    _depCleanup!.forEach((cleanup) => {
      AutoAsyncTask.addTask(cleanup, cleanup)
      // 删除全部_depCleanups对当前清理函数的记录
      depCleanupMap.get(cleanup)?.forEach((depCleanup) => {
        depCleanup.delete(cleanup)
      })
      depCleanupMap.delete(cleanup)
    })
  }

  private distribute(key: string | symbol = SYMBOL_EFFECT) {
    const _dep = this._deps.get(key) ?? this._deps.set(key, new Set()).get(key)!
    _dep.forEach((dep) => {
      const effectDepCleanups =
        effectDepMap.get(dep) ?? effectDepMap.set(dep, new Set()).get(dep)
      AutoAsyncTask.addTask(() => {
        const clear = dep()
        if (clear) {
          const _clear = () => {
            const { restore } = setComponentIns(effectEleMap.get(dep)!)
            clear()
            restore()
          }
          // 将effect的清理函数加入全部记录的_depCleanups
          effectDepCleanups?.forEach((depCleanup) => {
            depCleanup.add(_clear)
          })
          // 将当前清理函数与全部记录的_depCleanups对应
          depCleanupMap.set(_clear, effectDepCleanups!)
        }
      }, dep)
    })
  }

  get value() {
    return this._proxy
  }
}

export default Dependency

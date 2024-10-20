/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * class Dependency
 * 创建依赖
 * function effect
 * 创建副作用函数
 * function isRef
 * 判断是否为引用响应式
 * function isReactive
 * 判断是否为响应式对象
 */

import BaseElement, { type EffectCallback } from './BaseElement'
import { setComponentIns, getCurrentComponent } from './fixComponentIns'
import { onMounted } from './hooks/lifecycle/mounted'
import AutoAsyncTask from './utils/AutoAsyncTask'
import { isArray, isObject } from './utils/shared'

type DepCleanupSet = WeakSet<() => void>

type DepCleanupSets = Set<DepCleanupSet>

let currentEffectFn: EffectCallback | null = null

/** 记录effect和对应的元素实例 */
const effectEleMap = new WeakMap<EffectCallback, BaseElement>()

/** 记录当前运行的effect的依赖对应的清理函数集 */
const effectDepCleanupMap = new WeakMap<EffectCallback, DepCleanupSets>()

/** effect: effCallback和对应的effect */
// const effectEncapsulationMap = new WeakMap<EffectCallback, EffectCallback>()

/** 运行中的currentEffectFn列表，不包括最新的 */
const currentEffectFns: EffectCallback[] = []

/**
 * 创建副作用函数
 * @param effCallback 副作用函数
 * @returns void
 * @example
 * ```ts
 * effect(() => {
 *  console.log('effect')
 *  return () => {
 *    console.log('cleanup')
 *  }
 * })
 */
export const effect = (effCallback: EffectCallback) => {
  onMounted(() => {
    const ele = getCurrentComponent()
    // 此处不再限制 effect 必须在 setup 函数中调用
    // 但是没有测试过在其他地方调用的情况
    const effect = () => {
      const { restore } = (() => {
        if (ele) setComponentIns(ele)
        return { restore: () => {} }
      })()
      const _ret = effCallback()
      restore()
      return _ret
    }
    if (ele) {
      ele.$effects.add(effect)
      effectEleMap.set(effect, ele)
    }
    if (currentEffectFn) currentEffectFns.push(currentEffectFn)
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
    currentEffectFn = currentEffectFns.pop() ?? null
  })
}

/** 无key的依赖key */
const SYMBOL_EFFECT = Symbol('effect')
/** 被代理标志 */
const SYMBOL_DEPENDENCY = Symbol('dependency')

/** 函数上非纯函数的属性 */
const NOT_PURE_ARR_FUNC_KEY = [
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

/** 函数上修改this指向的属性 */
const BIND_THIS_FUNC_KEY = ['bind ', 'call', 'apply']

/**
 * 判断是否为引用响应式
 * @param val
 * @returns
 * @example
 * ```ts
 * const ref = ref(0)
 * console.log(isRef(ref)) // true
 * ```
 */
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

/**
 * 判断是否为响应式对象
 * @param val
 * @returns
 * @example
 * ```ts
 * const obj = reactive({})
 * console.log(isReactive(obj)) // true
 * ```
 */
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
/**  */
const effectDepMap = new WeakMap<EffectCallback, DepCleanupSets>()

// 记录单个清理函数和对应的_depCleanups
const depCleanupMap = new WeakMap<() => void, DepCleanupSets>()

/**
 * class Dependency
 * 创建依赖
 * @example
 * ```ts
 * const dep = new Dependency({})
 * console.log(dep.value) // {}
 * ```
 */
class Dependency<T extends object> {
  /**
   * 依赖集合
   * key: 依赖对象上的属性
   * value: 属性对应的effect集合
   */
  private _deps = new Map<string | symbol, Set<EffectCallback>>()
  /**
   * 依赖清理函数集合
   * key: 依赖对象上的属性
   * value: 属性对应的清理函数集合
   */
  private _depCleanups = new Map<string | symbol, Set<() => void>>()
  /** 代理对象 */
  private _value: object
  /** 代理处理器 */
  private _proxy: ProxyHandler<T>
  /**
   * 代理对象的属性是否被代理
   * 防止重复代理
   * 对于对象类型的属性, 需要深度代理
   */
  private _isProxy: Array<string | symbol> = []

  constructor(value: T) {
    this._value = value
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
        if (isObject(_value) && !this._isProxy.includes(key)) {
          const newDep = new Dependency(_value)
          Reflect.set(target, key, newDep.value, receiver)
          _ret = newDep.value
          this._isProxy.push(key)
        }

        if (
          typeof _value === 'function' &&
          isArray(target) &&
          NOT_PURE_ARR_FUNC_KEY.includes(String(key))
        ) {
          // return function (...args: Parameters<typeof _value>) {
          //   cleanup()
          //   const result = _value.apply(target, args)
          //   distribute()
          //   return result
          // }
          return new Proxy(_value, {
            apply: (target, thisArg, argArray) => {
              cleanup()
              const result = Reflect.apply(target, thisArg, argArray)
              distribute()
              return result
            },
            get: (target, key, receiver) => {
              if (key === SYMBOL_DEPENDENCY) return this

              if (BIND_THIS_FUNC_KEY.includes(String(key))) {
                return Reflect.get(target, key, receiver)
              }

              return Reflect.get(target, key, receiver)
            }
          })
        }

        if (isArray(target)) collect()
        else collect(key)
        return _ret
      },
      set: (target, key, value, receiver) => {
        if (isArray(target)) this.cleanup()
        else this.cleanup(key)
        if (isArray(target)) this.distribute()
        else this.distribute(key)
        return Reflect.set(target, key, value, receiver)
      }
    })
  }

  private collect(key: string | symbol = SYMBOL_EFFECT) {
    if (currentEffectFn) {
      // if (!ele || !hasSetupRunning()) {
      //   return /*@__PURE__*/ console.error('effect 必须在 setup 函数中调用')
      // }
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

      const effectFn = currentEffectFn
      const ele = effectEleMap.get(currentEffectFn)
      if (ele) {
        const eleDestroy = ele.__destroy__.bind(ele)
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

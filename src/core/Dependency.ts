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

import { getInstance, setComponentIns } from './fixComponentIns'
import { onMounted } from './hooks/lifecycle/mounted'
import { hasSetupRunning } from './hooks/lifecycle/verifySetup'
import AutoAsyncTask from './utils/AutoAsyncTask'
import { isArray, isObject } from './utils/shared'

type EffectCallback = () => EffectCleanupCallback | void

type EffectCallbackReturn = {
  stop: (opt?: { cleanup?: boolean }) => void
  run: () => void
}

type EffectCleanupCallback = () => void

let currentEffectFn: EffectCallback | null = null

/** 运行中的currentEffectFn列表，不包括最新的 */
const currentEffectFns: EffectCallback[] = []

/**
 * 保存effect和对应的Set<EffectCallback>
 * 一个effect对应多个Set<EffectCallback>
 */
const effectDepsMap = new Map<EffectCallback, Set<Set<EffectCallback>>>()

const effectReturnMap = new WeakMap<EffectCallback, EffectCallbackReturn>()

/**
 * 创建副作用函数
 * @param effCallback 副作用函数
 * @returns 停止运行副作用函数
 * @example
 * ```ts
 * const stop = effect(() => {
 *   console.log('effect')
 *   return () => {
 *     console.log('cleanup')
 *   }
 * })
 * stop()
 */
export const effect = (effCallback: EffectCallback): EffectCallbackReturn => {
  if (hasSetupRunning()) {
    const effectCallbackReturn: EffectCallbackReturn = {
      stop: () => {
        console.warn(
          `自定义组件内effect的stop方法只能在onMounted生命周期运行后调用`
        )
      },
      run: () => {
        console.warn(
          `自定义组件内effect的run方法只能在onMounted生命周期运行后调用`
        )
      }
    }
    onMounted(() => {
      const ele = getInstance()
      const _ret = _effect(() => {
        const { restore } = setComponentIns(ele)
        const _ret = effCallback()
        restore()
        return _ret
      })
      effectCallbackReturn.stop = _ret.stop
      effectCallbackReturn.run = _ret.run
      return _ret.stop
    })
    return effectCallbackReturn
  } else {
    return _effect(effCallback)
  }
}

const _effect = (effCallback: EffectCallback): EffectCallbackReturn => {
  const effect = effCallback
  effectDepsMap.set(effect, new Set())
  if (currentEffectFn) currentEffectFns.push(currentEffectFn)
  currentEffectFn = effect
  let cleanupSet: Set<EffectCleanupCallback> | null =
    new Set<EffectCleanupCallback>()
  let clear = effect() ?? null
  if (clear) {
    cleanupSet.add(clear)
    clear = null
  }
  currentEffectFn = currentEffectFns.pop() ?? null

  const cleanup = () => {
    if (!cleanupSet) return
    cleanupSet.forEach((cleanup, _, set) => {
      AutoAsyncTask.addTask(() => {
        cleanup()
      }, cleanup)
      set.delete(cleanup)
    })
  }

  const effectCallbackReturn: EffectCallbackReturn = {
    stop: (opt) => {
      if (!cleanupSet) return
      if (opt?.cleanup) cleanup()
      cleanupSet = null
      // 获取影响当前effect的依赖
      const effectDeps = effectDepsMap.get(effect)
      // 删除effect对应的依赖中的effect
      effectDeps?.forEach((dep) => {
        dep.delete(effect)
      })
      effectDepsMap.delete(effect)
    },
    run: () => {
      if (!cleanupSet) return
      cleanup()
      AutoAsyncTask.addTask(() => {
        if (!cleanupSet) return
        let clear = effect() ?? null
        if (clear) {
          cleanupSet.add(clear)
          clear = null
        }
      }, effect)
    }
  }
  effectReturnMap.set(effect, effectCallbackReturn)
  return effectCallbackReturn
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
          // TODO: 未测试
          return new Proxy(_value, {
            apply: (target, thisArg, argArray) => {
              collect()
              const result = Reflect.apply(target, thisArg, argArray)
              distribute()
              return result
            },
            get: (target, key, receiver) => {
              if (key === SYMBOL_DEPENDENCY) return this

              if (BIND_THIS_FUNC_KEY.includes(String(key))) {
                return Reflect.get(target, key, receiver)
              }

              collect()
              return Reflect.get(target, key, receiver)
            }
          })
        }

        if (isArray(target)) collect()
        else collect(key)
        return _ret
      },
      set: (target, key, value, receiver) => {
        if (isArray(target)) this.distribute()
        else this.distribute(key)
        return Reflect.set(target, key, value, receiver)
      }
    })
  }

  private collect(key: string | symbol = SYMBOL_EFFECT) {
    if (currentEffectFn) {
      const _dep =
        this._deps.get(key) ?? this._deps.set(key, new Set()).get(key)!
      _dep.add(currentEffectFn)

      const effectDeps = effectDepsMap.get(currentEffectFn)!
      effectDeps.add(_dep)
    }
  }

  private distribute(key: string | symbol = SYMBOL_EFFECT) {
    const _dep = this._deps.get(key) ?? this._deps.set(key, new Set()).get(key)!
    _dep.forEach((dep) => {
      effectReturnMap.get(dep)?.run()
    })
  }

  get value() {
    return this._proxy
  }
}

export default Dependency

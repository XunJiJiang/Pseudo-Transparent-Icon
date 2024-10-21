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

type OnCleanup = (cleanupFn: EffectCleanupFn) => void

type EffectFn = (onCleanup: OnCleanup) => EffectCleanupFn | void

type StopFn = (opt?: { cleanup?: boolean }) => void

type EffectFnReturnFn = {
  stop: StopFn
  run: () => void
  pause: () => void
  resume: () => void
}

type EffectFnReturn = {
  (opt?: { cleanup?: boolean }): void
} & EffectFnReturnFn

type EffectCleanupFn = () => void

let currentEffectFn: EffectFn | null = null

/** 运行中的currentEffectFn列表，不包括最新的 */
const currentEffectFns: EffectFn[] = []

/**
 * 保存effect和对应的Set<EffectFn>
 * 一个effect对应多个Set<EffectFn>
 */
const effectDepsMap = new Map<EffectFn, Set<Set<EffectFn>>>()

const effectReturnMap = new WeakMap<EffectFn, EffectFnReturn>()

/**
 * 创建副作用函数
 * @param effFn 副作用函数
 * @returns 停止运行副作用函数
 * @example
 * ```ts
 * const stop = effect(() => {
 *   console.log('effect')
 *   return () => {
 *     console.log('cleanup')
 *   }
 * })
 * // 停止
 * stop()
 *
 * const { pause, resume, run, stop } = effect(() => {
 *   console.log('effect')
 *   return () => {
 *     console.log('cleanup')
 *   }
 * })
 * // 暂停
 * pause()
 * // 恢复
 * resume()
 * // 运行一次
 * run()
 * // 停止
 * stop()
 */
export const effect = (effFn: EffectFn): EffectFnReturn => {
  if (hasSetupRunning()) {
    let stopFn: StopFn | null = null
    const effectFnReturn: EffectFnReturn = (opt) => effectFnReturn.stop(opt)
    effectFnReturn.stop = (opt) => {
      if (stopFn) return stopFn(opt)
      console.warn(
        `自定义组件内effect的stop方法只能在onMounted生命周期运行后调用`
      )
    }
    effectFnReturn.run = () => {
      console.warn(
        `自定义组件内effect的run方法只能在onMounted生命周期运行后调用`
      )
    }
    effectFnReturn.pause = () => {
      console.warn(
        `自定义组件内effect的pause方法只能在onMounted生命周期运行后调用`
      )
    }
    effectFnReturn.resume = () => {
      console.warn(
        `自定义组件内effect的resume方法只能在onMounted生命周期运行后调用`
      )
    }

    onMounted(() => {
      const ele = getInstance()
      const _ret = _effect((onCleanup) => {
        const { restore } = setComponentIns(ele)
        const _ret = effFn(onCleanup)
        restore()
        return _ret
      })
      stopFn = _ret
      effectFnReturn.stop = _ret.stop
      effectFnReturn.run = _ret.run
      effectFnReturn.pause = _ret.pause
      effectFnReturn.resume = _ret.resume
      return _ret
    })

    return effectFnReturn
  } else {
    return _effect(effFn)
  }
}

enum EffectStatus {
  RUNNING,
  PAUSE,
  STOP
}

const _effect = (effectFn: EffectFn): EffectFnReturn => {
  effectDepsMap.set(effectFn, new Set())
  let state = EffectStatus.RUNNING
  if (currentEffectFn) currentEffectFns.push(currentEffectFn)
  currentEffectFn = effectFn
  let cleanupSet: Set<EffectCleanupFn> | null = new Set<EffectCleanupFn>()
  let effectFnRun = false
  const onCleanup: OnCleanup = (cleanupFn) => {
    if (state === EffectStatus.STOP) return
    if (effectFnRun) {
      cleanupSet!.add(cleanupFn)
      return
    }
    /*__PURE__*/ console.error(`effect函数的onCleanup只能在effect函数内部调用`)
  }
  effectFnRun = true
  let cleanupFn = effectFn(onCleanup) ?? null
  effectFnRun = false
  if (cleanupFn) {
    onCleanup(cleanupFn)
    cleanupFn = null
  }
  currentEffectFn = currentEffectFns.pop() ?? null

  const cleanup = () => {
    if (state === EffectStatus.STOP) return
    cleanupSet!.forEach((cleanupFn, _, set) => {
      cleanupFn()
      set.delete(cleanupFn)
    })
  }

  const effectFnReturn: EffectFnReturn = (opt) => effectFnReturn.stop(opt)
  effectFnReturn.stop = (opt) => {
    if (state === EffectStatus.STOP) return
    if (opt?.cleanup) cleanup()
    state = EffectStatus.STOP
    cleanupSet = null
    // 获取影响当前effect的依赖
    const effectDeps = effectDepsMap.get(effectFn)
    // 删除effect对应的依赖中的effect
    effectDeps?.forEach((dep) => {
      dep.delete(effectFn)
    })
    effectDepsMap.delete(effectFn)
  }
  effectFnReturn.run = () => {
    if (state === EffectStatus.STOP) return
    cleanup()
    AutoAsyncTask.addTask(() => {
      if (state === EffectStatus.STOP) return
      effectFnRun = true
      let cleanupFn = effectFn(onCleanup) ?? null
      effectFnRun = false
      if (cleanupFn) {
        onCleanup(cleanupFn)
        cleanupFn = null
      }
    }, effect)
  }
  effectFnReturn.pause = () => {
    if (state === EffectStatus.STOP) return
    state = EffectStatus.PAUSE
  }
  effectFnReturn.resume = () => {
    if (state === EffectStatus.STOP) return
    state = EffectStatus.RUNNING
  }
  effectReturnMap.set(effectFn, effectFnReturn)
  return effectFnReturn
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
  private _deps = new Map<string | symbol, Set<EffectFn>>()
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
    _dep.forEach((effectFn) => {
      effectReturnMap.get(effectFn)?.run()
    })
  }

  get value() {
    return this._proxy
  }
}

export default Dependency

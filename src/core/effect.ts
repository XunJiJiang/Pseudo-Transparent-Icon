import { onBeforeMount } from './hooks/lifecycle/beforeMount'
import { onMounted } from './hooks/lifecycle/mounted'
import { hasSetupRunning } from './hooks/lifecycle/verifySetup'
import AutoAsyncTask from './utils/AutoAsyncTask'
import { isPromise } from './utils/shared'

// ABOUT: flush
// 对于在setup函数中运行的effect
//       post: 在onMounted后运行 默认
//       pre: 在onMounted前运行
//       sync: 同步运行
// 对于其他effect
//       post\pre: 异步运行 默认
//       sync: 同步运行

type EffectCleanupFn = () => void

// TODO: 如果effect要支持异步函数, 则 onCleanup 需要限制在await前调用
// 如果传入异步函数，则不会将effect的返回值作为cleanup函数
type OnCleanup = (cleanupFn: EffectCleanupFn) => void

type EffectFnSync = (onCleanup: OnCleanup) => EffectCleanupFn | void

type EffectFnAsync = (onCleanup: OnCleanup) => Promise<unknown>

export type EffectFn = EffectFnSync | EffectFnAsync

export type StopFn = (opt?: { cleanup?: boolean }) => void

export const SYMBOL_PRIVATE = Symbol('private')

interface EffectHandle {
  (opt?: { cleanup?: boolean }): void
  stop: (opt?: { cleanup?: boolean }) => void
  pause: () => void
  resume: () => void
  __run__: (cb: () => void, privateSymbol: typeof SYMBOL_PRIVATE) => void
}

type EffectOpt = {
  flush?: 'pre' | 'sync' | 'post'
}

let currentEffectFn: EffectFn | null = null

export const getCurrentEffectFn = () => currentEffectFn

/** 运行中的currentEffectFn列表，不包括最新的 */
const currentEffectFns: EffectFn[] = []

/**
 * 保存effect和对应的Set<EffectFn>
 * 一个effect对应多个Set<EffectFn>
 */
export const effectDepsMap = new Map<EffectFn, Set<Set<EffectFn>>>()

export const effectReturnMap = new WeakMap<EffectFn, EffectHandle>()

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
 * const { pause, resume, stop } = effect(() => {
 *   console.log('effect')
 *   return () => {
 *     console.log('cleanup')
 *   }
 * })
 * // 暂停
 * pause()
 * // 恢复
 * resume()
 * // 停止
 * stop()
 */
export const effect = (effFn: EffectFn, opt?: EffectOpt): EffectHandle => {
  const inSetup = hasSetupRunning()
  const flush = opt?.flush ?? 'post'
  opt = { flush }

  if (inSetup && flush !== 'sync') {
    let stopFn: StopFn | null = null
    const effectFnReturn: EffectHandle = (opt) => effectFnReturn.stop(opt)
    effectFnReturn.stop = (opt) => {
      if (stopFn) return stopFn(opt)
      console.warn(
        `自定义组件内effect的stop方法只能在onMounted生命周期运行后调用`
      )
    }
    effectFnReturn.__run__ = () => {
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
    if (flush === 'post') {
      onMounted(() => {
        const _ret = _effect(async (onCleanup) => {
          const _ret = await effFn(onCleanup)
          return _ret
        }, opt)
        stopFn = _ret
        effectFnReturn.stop = _ret.stop
        effectFnReturn.__run__ = _ret.__run__
        effectFnReturn.pause = _ret.pause
        effectFnReturn.resume = _ret.resume
        return _ret
      })
    } else if (flush === 'pre') {
      let _stopFn: EffectCleanupFn
      onBeforeMount(() => {
        const _ret = _effect(async (onCleanup) => {
          const _ret = await effFn(onCleanup)
          return _ret
        }, opt)
        _stopFn = _ret
        stopFn = _ret
        effectFnReturn.stop = _ret.stop
        effectFnReturn.__run__ = _ret.__run__
        effectFnReturn.pause = _ret.pause
        effectFnReturn.resume = _ret.resume
      })
      onMounted(() => {
        return _stopFn
      })
    }

    return effectFnReturn
  } else {
    return _effect(effFn, opt)
  }
}

enum EffectStatus {
  RUNNING,
  PAUSE,
  STOP
}

const _effect = (effectFn: EffectFn, opt: EffectOpt): EffectHandle => {
  // const flush = opt.flush

  effectDepsMap.set(effectFn, new Set())
  let state = EffectStatus.RUNNING
  if (currentEffectFn) currentEffectFns.push(currentEffectFn)
  currentEffectFn = effectFn
  let cleanupSet: Set<EffectCleanupFn> | null = new Set<EffectCleanupFn>()
  const onCleanup: OnCleanup = (cleanupFn) => {
    if (state === EffectStatus.STOP) return
    cleanupSet!.add(cleanupFn)
  }
  let cleanupFn = effectFn(onCleanup) ?? null
  if (cleanupFn && !isPromise(cleanupFn)) {
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

  const effectFnReturn: EffectHandle = (opt) => effectFnReturn.stop(opt)
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
  effectFnReturn.__run__ = (cb) => {
    if (state === EffectStatus.STOP || state === EffectStatus.PAUSE) {
      cb()
      return
    }
    cleanup()

    cb()

    if (opt.flush === 'sync') {
      let cleanupFn = effectFn(onCleanup) ?? null
      if (cleanupFn && !isPromise(cleanupFn)) {
        onCleanup(cleanupFn)
        cleanupFn = null
      }
    } else {
      AutoAsyncTask.addTask(() => {
        if (state === EffectStatus.STOP) return
        let cleanupFn = effectFn(onCleanup) ?? null
        if (cleanupFn && !isPromise(cleanupFn)) {
          onCleanup(cleanupFn)
          cleanupFn = null
        }
      }, effect)
    }
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

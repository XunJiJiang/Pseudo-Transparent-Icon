/* eslint-disable @typescript-eslint/no-explicit-any */
import { isReactive } from './Dependency'
import { _effect } from './effect'
import { isRef, Ref } from './ref'
import { isArray } from './utils/shared'

// TODO: 大量使用 as

// ABOUT: flush
// 对于在setup函数中运行的effect
//       post: 初次在onMounted后运行, 之后异步运行 默认
//       pre: 初次在onMounted前运行, 之后异步运行
//       sync: 同步运行
// 对于其他effect
//       post\pre: 异步运行 默认
//       sync: 同步运行

export interface Watch {
  <T>(
    source: WatchSource<T>,
    callback: WatchCallback<T>,
    options?: Partial<WatchOptions>
  ): WatchHandle
  <T>(
    sources: WatchSource<T>[],
    callback: WatchCallback<T[]>,
    options?: Partial<WatchOptions>
  ): WatchHandle
}

type WatchSourceRef<T> = T extends Ref<infer R> ? R : T

type WatchSourceRefs<T> = {
  [K in keyof T]: WatchSourceRef<T[K]>
}

type WatchCallback<T> = (
  value: WatchSourceRef<T>,
  oldValue: WatchSourceRef<T>,
  onCleanup: (cleanupFn: () => void) => void
) => void

type WatchCallbackArray<T> = (
  value: WatchSourceRefs<T>,
  oldValue: WatchSourceRefs<T>,
  onCleanup: (cleanupFn: () => void) => void
) => void

// 初次运行时, oldValue 与 value 相同
type WatchSource<T> =
  | Ref<T> // ref 自动解ref 当ref为基础数据类型时, 新旧值才会不同
  | (() => T) // getter 返回值必须依赖于响应式对象 当返回值为基础数据类型时, 新旧值才会不同
  | T extends object // 响应式对象
  ? T
  : never

type WatchSources<T> = {
  [K in keyof T & number]: WatchSource<T[K]>
} & any[]

interface WatchOptions {
  deep: boolean | number // 默认：false
  flush: 'pre' | 'post' | 'sync' // 默认：'post'
  sync: boolean // 默认：false 是否启用同步模式 该模式下, 同步修改的依赖的回调会在下一个微任务内同步执行
}

interface WatchHandle {
  (opt?: { cleanup?: boolean }): void
  pause: (opt?: { cleanup?: boolean }) => void
  resume: () => void
  stop: () => void
}

const deepTraverse = <T>(value: T, deep: number | true): T => {
  const map = new WeakMap()

  const _deepTraverse = (value: T, deep: number | true) => {
    if (value && value instanceof Node) {
      return value
    }

    if (deep === 0) return value

    if (typeof value !== 'object' || value === null) return value
    if (map.has(value)) return map.get(value)

    const result: { [key: string]: any } = isArray(value) ? [] : {}

    map.set(value, result)

    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        result[key] = _deepTraverse(
          (value as { [key: string]: any })[key],
          deep === true ? true : deep - 1
        )
      }
    }

    return result
  }

  return _deepTraverse(value, deep)
}

const watchForAlone = <T>(
  source: WatchSource<T>,
  callback: WatchCallback<T>,
  options: WatchOptions
): WatchHandle => {
  const value: {
    oldValue: WatchSourceRef<T>
    value: WatchSourceRef<T>
  } = {
    oldValue: undefined as WatchSourceRef<T>,
    value: undefined as WatchSourceRef<T>
  }

  let isFirst = true

  return _effect(
    [
      () => {
        if (isRef<T>(source)) {
          value.value = source.value as WatchSourceRef<T>
        } else if (typeof source === 'function') {
          value.value = source()
        } else {
          value.value = source as WatchSourceRef<T>
        }

        if (
          typeof value.value === 'object' &&
          value.value !== null &&
          options.deep !== false
        ) {
          const _val = deepTraverse(value.value, options.deep)
          value.value = _val
        }

        if (isFirst) {
          value.oldValue = value.value
          isFirst = false
        }
      },
      (onCleanup) => {
        callback(value.value, value.oldValue, onCleanup)
        value.oldValue = value.value
      }
    ],
    {
      flush: options.flush,
      sync: options.sync
    }
  )
}

const watchForArray = <T>(
  sources: WatchSources<T>,
  callback: WatchCallbackArray<T>,
  options: WatchOptions
): WatchHandle => {
  const value: {
    oldValue: WatchSources<T>
    value: WatchSources<T>
  } = {
    oldValue: [] as WatchSources<T>,
    value: [] as WatchSources<T>
  }

  let isFirst = true

  return _effect(
    [
      () => {
        sources.forEach((source, index) => {
          if (isRef<T>(source)) {
            value.value[index] = source.value as T
          } else if (typeof source === 'function') {
            value.value[index] = source()
          } else {
            value.value[index] = source
          }

          if (
            typeof value.value[index] === 'object' &&
            value.value[index] !== null &&
            options.deep !== false
          ) {
            const _val = deepTraverse(value.value[index], options.deep)
            value.value[index] = _val
          }
        })

        if (isFirst) {
          value.oldValue = value.value
          isFirst = false
        }
      },
      (onCleanup) => {
        callback(
          value.value as WatchSourceRefs<T>,
          value.oldValue as WatchSourceRefs<T>,
          onCleanup
        )
        value.oldValue = []
        for (const item of value.value) {
          value.oldValue.push(item)
        }
      }
    ],
    {
      flush: options.flush,
      sync: options.sync
    }
  )
}

export const watch: Watch = <T>(
  source: WatchSource<T> | WatchSources<T>,
  callback: WatchCallback<T> | WatchCallbackArray<T>,
  options?: Partial<WatchOptions>
): WatchHandle => {
  const opt: WatchOptions = {
    deep: false,
    flush: 'post',
    sync: false,
    ...(options ?? {})
  }

  if (!isReactive(source) && isArray(source)) {
    return watchForArray(source, callback as WatchCallbackArray<T>, opt)
  } else {
    return watchForAlone(source, callback as WatchCallback<T>, opt)
  }
}

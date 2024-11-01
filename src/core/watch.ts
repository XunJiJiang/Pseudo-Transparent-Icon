/* eslint-disable @typescript-eslint/no-explicit-any */
import { effectAboutFlush } from './effect'
import { isRef, Ref } from './ref'
import { isArray } from './utils/shared'

// TODO: watch类型声明问题
// 当依赖是Ref时, callback的value和oldValue的类型是Ref<T>, 预期是T

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

type WatchCallback<T> = (
  value: T,
  oldValue: T,
  onCleanup: (cleanupFn: () => void) => void
) => void

// 初次运行时, oldValue 与 value 相同
type WatchSource<T> =
  | Ref<T> // ref 自动解ref 当ref为基础数据类型时, 新旧值才会不同
  | (() => T) // getter 返回值必须依赖于响应式对象 当返回值为基础数据类型时, 新旧值才会不同
  | T extends object // 响应式对象
  ? T
  : never // 响应式对象

interface WatchOptions {
  deep: boolean | number // 默认：false
  flush: 'pre' | 'post' | 'sync' // 默认：'post'
}

interface WatchHandle {
  (): void // 可调用，与 `stop` 相同
  pause: () => void
  resume: () => void
  stop: () => void
}

// 使用类似深拷贝的写法
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
    oldValue: T
    value: T
  } = {
    oldValue: undefined as T,
    value: undefined as T
  }

  let isFirst = true

  return effectAboutFlush(
    [
      () => {
        if (isRef<T>(source)) {
          value.value = source.value as T
        } else if (typeof source === 'function') {
          value.value = source()
        } else {
          value.value = source
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
      flush: options.flush
    }
  )
}

const watchForArray = <T>(
  sources: WatchSource<T>[],
  callback: WatchCallback<T[]>,
  options: WatchOptions
): WatchHandle => {
  const value: {
    oldValue: T[]
    value: T[]
  } = {
    oldValue: [],
    value: []
  }

  let isFirst = true

  return effectAboutFlush(
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
        callback(value.value, value.oldValue, onCleanup)
        value.oldValue = []
        for (const item of value.value) {
          value.oldValue.push(item)
        }
      }
    ],
    {
      flush: options.flush
    }
  )
}

export const watch: Watch = <T>(
  source: WatchSource<T> | WatchSource<T>[],
  callback: WatchCallback<T> | WatchCallback<T[]>,
  options?: Partial<WatchOptions>
): WatchHandle => {
  const opt: WatchOptions = {
    deep: false,
    flush: 'post',
    ...(options ?? {})
  }

  if (isArray(source)) {
    return watchForArray(source, callback as WatchCallback<T[]>, opt)
  } else {
    return watchForAlone(source, callback as WatchCallback<T>, opt)
  }
}

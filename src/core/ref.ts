import { Reactive, reactive } from './reactive'
import { isObject } from './utils/shared'

export interface CreateRef {
  <T>(value: null): Ref<T | null>
  <T>(value: T): Ref<T>
}

// 外部类型声明，将一个数据的类型转为ref类型
export type RefType<T> = { value: T }

const SYMBOL_REF = Symbol('ref')

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
export const isRef = <T = unknown>(val: unknown): val is Ref<T> => {
  return (
    isObject(val) &&
    SYMBOL_REF in (val as RefImpl<T>) &&
    (val as RefImpl<T>)[SYMBOL_REF] === true
  )
}

class RefImpl<T> {
  private [SYMBOL_REF] = true

  #value: Reactive<{
    value: T
  }>

  constructor(value: T) {
    this.#value = reactive({ value })
  }

  get value(): T extends object ? Reactive<T> : T {
    return this.#value.value
  }

  set value(value: T) {
    this.#value.value = value as T extends object ? Reactive<T> : T
  }
}

export type Ref<T> = RefImpl<T>

/**
 * 创建Ref
 * @param value
 * @returns
 * @example
 * ```ts
 * const ref = ref(0)
 * console.log(ref.value) // 0
 * ref.value = 1
 * console.log(ref.value) // 1
 * ```
 */
export const ref: CreateRef = <T>(value: T | null) => {
  return new RefImpl(value)
}

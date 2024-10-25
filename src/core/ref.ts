import reactive from './reactive'

interface Ref {
  <T>(value: null): { value: T | null }
  <T>(value: T): { value: T }
}

// 外部类型声明，将一个数据的类型转为ref类型
export type RefType<T> = { value: T }

const ref: Ref = <T>(value: T | null) => {
  const _reactive = reactive({ value })
  if (value !== null) {
    return _reactive as { value: T }
  } else {
    return _reactive
  }
}

export default ref

import reactive from './reactive'

interface Ref {
  <T>(value: null): { value: T | null }
  <T>(value: T): { value: T }
}

const ref: Ref = <T>(value: T | null) => {
  const _reactive = reactive({ value })
  if (value !== null) {
    return _reactive as { value: T }
  } else {
    return _reactive
  }
}

export default ref

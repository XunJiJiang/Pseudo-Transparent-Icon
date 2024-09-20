/**
 * Dependency class
 * 创建一个依赖项
 */

export type EffectCallback = () => (() => void) | void

let currentEffectFn: EffectCallback | null = null

export const useEffect = (effCallback: EffectCallback) => {
  currentEffectFn = effCallback
  effCallback()
  currentEffectFn = null
}

class Dependency<T extends object> {
  private _value: object
  private _proxy: ProxyHandler<T>
  private _deps: Set<EffectCallback> = new Set()

  constructor(value: T) {
    this._value = value

    this._proxy = new Proxy(this._value, {
      get: (target, key, receiver) => {
        this.collect()
        return Reflect.get(target, key, receiver)
      },
      set: (target, key, value, receiver) => {
        Reflect.set(target, key, value, receiver)
        this.distribute()
        return true
      }
    })
  }

  private collect() {
    if (currentEffectFn) {
      this._deps.add(currentEffectFn)
    }
  }

  private distribute() {
    this._deps.forEach((dep) => {
      const _return = dep()
      if (_return) {
        _return()
      }
    })
  }

  get value() {
    return this._proxy
  }
}

export default Dependency

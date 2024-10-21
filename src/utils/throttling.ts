import { Func } from '@type/function'

type CallBacks =
  | Func
  | {
      [key: string]: Func
    }

type Opt = {
  // immediate: 立即执行第一次, 之后与 delay 一样
  // delay: 延迟执行, 期间不会执行
  // once: 执行一次, 在延时期内不会再理会任何触发
  type: 'immediate' | 'delay' | 'once'
}

type ThrottlingReturn<T> = T extends Func ? Func : { [key in keyof T]: Func }

const defaultOpt: Opt = {
  type: 'delay'
}

const throttling = <T extends CallBacks>(
  callbacks: T,
  ms = 300,
  opt?: Partial<Opt>
): ThrottlingReturn<T> => {
  opt = Object.assign({}, defaultOpt, opt)
  let timer: number | null = null
  let runOne: ((callback: Func) => Func) | null = null
  if (opt.type === 'immediate') {
    /** 是否需要在计时结束后运行一次 */
    runOne = (callback: Func) => {
      let needRun: null | Parameters<typeof callback> = null
      const ret = (...args: Parameters<typeof callback>) => {
        if (!timer) {
          callback(...args)
          needRun = null
          timer = setTimeout(() => {
            timer = null
            if (needRun) {
              ret(...needRun)
            }
          }, ms)
        } else {
          needRun = args
        }
      }

      return ret
    }
  } else if (opt.type === 'delay') {
    runOne = (callback: Func) => {
      return (...args: Parameters<typeof callback>) => {
        if (timer) return
        timer = setTimeout(() => {
          callback(...args)
          timer = null
        }, ms)
      }
    }
  } else if (opt.type === 'once') {
    runOne = (callback: Func) => {
      return (...args: Parameters<typeof callback>) => {
        if (timer) return
        callback(...args)
        timer = setTimeout(() => {
          timer = null
        }, ms)
      }
    }
  }

  if (runOne) {
    if (typeof callbacks === 'function') {
      return runOne(callbacks) as ThrottlingReturn<T>
    } else {
      const ret: Record<string, Func> = {}
      for (const key in callbacks) {
        ret[key] = runOne(callbacks[key] as Func)
      }
      return ret as ThrottlingReturn<T>
    }
  }

  throw new Error('throttling: 非法的 opt.type')
}

export default throttling

// console.log(global)

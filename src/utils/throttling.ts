import { Func } from '@type/function'

type Opt = {
  // immediate: 立即执行第一次, 之后与 delay 一样
  // delay: 延迟执行, 期间不会执行
  // once: 执行一次, 在延时期内不会再理会任何触发
  type: 'immediate' | 'delay' | 'once'
}

const defaultOpt: Opt = {
  type: 'delay'
}

const throttling = (callback: Func, ms = 300, opt?: Partial<Opt>) => {
  opt = Object.assign({}, defaultOpt, opt)
  let timer: NodeJS.Timeout | null = null
  if (opt.type === 'immediate') {
    /** 是否需要在计时结束后运行一次 */
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
  } else if (opt.type === 'delay') {
    return (...args: Parameters<typeof callback>) => {
      if (timer) return
      timer = setTimeout(() => {
        callback(...args)
        timer = null
      }, ms)
    }
  } else if (opt.type === 'once') {
    return (...args: Parameters<typeof callback>) => {
      if (timer) return
      callback(...args)
      timer = setTimeout(() => {
        timer = null
      }, ms)
    }
  }
  throw new Error('throttling: 非法的 opt.type')
}

export default throttling

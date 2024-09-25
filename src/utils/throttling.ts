import { Func } from '@type/function'

const throttling = (callback: Func, ms = 300) => {
  let timer: NodeJS.Timeout | null = null
  return () => {
    if (timer) return
    timer = setTimeout(() => {
      callback()
      timer = null
    }, ms)
  }
}

export default throttling

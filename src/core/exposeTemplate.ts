import { getCurrentComponent } from './fixComponentIns'

const exposeTemplate = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Record<string, any> = Record<string, unknown>
>(
  exposeKey: string
) => {
  const currentComponent = getCurrentComponent()
  if (currentComponent) {
    const _ref = {
      value: null
    } as {
      value: T | null
    }
    currentComponent.$exposes[exposeKey] = _ref
    return _ref
  }

  throw new Error('exposeTemplate 必须在 setup 函数中使用。')
}

export default exposeTemplate

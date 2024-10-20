/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, type Mock } from 'vitest'
import refTemplate from './refTemplate'
import { getCurrentComponent } from './fixComponentIns'
import { getRunningSetup } from './hooks/lifecycle/verifySetup'

type GetCurrentComponent = Mock<
  () => {
    $refs: Record<string, { value: Element | null }>
  } | null
>

type GetRunningSetup = Mock<() => boolean>

vi.mock('./fixComponentIns', () => ({
  getCurrentComponent: vi.fn()
}))

vi.mock('./hooks/lifecycle/verifySetup', () => ({
  getRunningSetup: vi.fn()
}))

describe('refTemplate', () => {
  it('refTemplate声明时的同步内容', () => {
    const mockComponent = {
      $refs: {}
    }
    ;(getRunningSetup as GetRunningSetup).mockReturnValue(true)
    ;(getCurrentComponent as GetCurrentComponent).mockReturnValue(mockComponent)

    const refKey = 'testRef'
    const ref = refTemplate<HTMLElement>(refKey)

    expect(ref).toEqual({ value: null })
    expect(mockComponent.$refs[refKey]).toBe(ref)
  })

  it('refTemplate 在 setup 函数外调用时报错', () => {
    ;(getRunningSetup as GetRunningSetup).mockReturnValue(false)

    expect(() => refTemplate<HTMLElement>('testRef')).toThrow(
      'refTemplate 必须在 setup 函数中使用。'
    )
  })

  it('currentComponent 组件为空时报错', () => {
    ;(getRunningSetup as GetRunningSetup).mockReturnValue(true)
    ;(getCurrentComponent as GetCurrentComponent).mockReturnValue(null)

    expect(() => refTemplate<HTMLElement>('testRef')).toThrow(
      'refTemplate 必须在 setup 函数中使用。'
    )
  })

  // TODO: 在自定义组件被加入到页面后, 通过 refTemplate 获取的 ref 会被赋值为对应的元素
})

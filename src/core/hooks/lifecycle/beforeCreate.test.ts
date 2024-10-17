/**
 * @vitest-environment jsdom
 */
import { describe, test, expect, vi, beforeEach, type Mock } from 'vitest'
import {
  onBeforeCreate,
  runBeforeCreate,
  clearBeforeCreate
} from './beforeCreate'
import { getRunningSetup } from './verifySetup'

vi.mock('./verifySetup', () => ({
  getRunningSetup: vi.fn()
}))

describe('beforeCreate lifecycle hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('onBeforeCreate should add callback to callbackSet if in setup', () => {
    ;(getRunningSetup as Mock).mockReturnValue(true)
    const callback = vi.fn()

    onBeforeCreate(callback)

    runBeforeCreate()

    expect(callback).toHaveBeenCalled()
  })

  test('onBeforeCreate should not add callback if not in setup', () => {
    ;(getRunningSetup as Mock).mockReturnValue(false)
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const callback = vi.fn()

    onBeforeCreate(callback)

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'onBeforeCreate 必须在 setup 函数中调用'
    )
    consoleErrorSpy.mockRestore()
  })

  test('runBeforeCreate should execute all callbacks and store clear functions', () => {
    ;(getRunningSetup as Mock).mockReturnValue(true)
    const clearFn = vi.fn()
    const callback = vi.fn(() => clearFn)

    onBeforeCreate(callback)

    runBeforeCreate()

    expect(callback).toHaveBeenCalled()
    expect(clearFn).not.toHaveBeenCalled()

    clearBeforeCreate()

    expect(clearFn).toHaveBeenCalled()
  })

  test('clearBeforeCreate should execute all clear functions', () => {
    const clearFn = vi.fn()
    const callback = vi.fn(() => clearFn)

    ;(getRunningSetup as Mock).mockReturnValue(true)
    onBeforeCreate(callback)

    runBeforeCreate()
    clearBeforeCreate()

    expect(clearFn).toHaveBeenCalled()
  })
})

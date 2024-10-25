/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import AutoAsyncTask from './AutoAsyncTask'

describe('AutoAsyncTask', () => {
  beforeEach(() => {
    // Clear the taskLists map and reset the promise before each test
    ;(AutoAsyncTask as any).taskLists.forEach((t) => t.clear())
    ;(AutoAsyncTask as any).promise = null
  })

  it('添加并执行一个任务', async () => {
    const task = vi.fn()

    AutoAsyncTask.addTask(task)

    await (AutoAsyncTask as any).promise

    expect(task).toHaveBeenCalled()
  })

  it('如果使用相同的密钥添加，则不会执行两次相同的任务', async () => {
    const task = vi.fn()
    const key = () => {}

    AutoAsyncTask.addTask(task, key)
    AutoAsyncTask.addTask(task, key)

    await (AutoAsyncTask as any).promise

    expect(task).toHaveBeenCalledTimes(1)
  })

  it('按添加的顺序执行任务', async () => {
    const task1 = vi.fn()
    const task2 = vi.fn()

    AutoAsyncTask.addTask(task1)
    AutoAsyncTask.addTask(task2)

    await (AutoAsyncTask as any).promise

    expect(task1).toHaveBeenCalled()
  })

  it('使用不同的键分别处理任务', async () => {
    const task1 = vi.fn()
    const task2 = vi.fn()
    const key1 = () => {}
    const key2 = () => {}

    AutoAsyncTask.addTask(task1, key1)
    AutoAsyncTask.addTask(task2, key2)

    await (AutoAsyncTask as any).promise

    expect(task1).toHaveBeenCalled()
    expect(task2).toHaveBeenCalled()
  })

  it('如果使用相同的密钥添加，则只执行最后一次添加的任务', async () => {
    const task1 = vi.fn()
    const task2 = vi.fn()
    const key = () => {}

    AutoAsyncTask.addTask(task1, key)
    AutoAsyncTask.addTask(task2, key)

    await (AutoAsyncTask as any).promise

    expect(task1).not.toHaveBeenCalled()
    expect(task2).toHaveBeenCalled()
  })

  it('在执行任务期间添加任务，会放到下一次执行', async () => {
    const task1 = vi.fn()
    const task2 = vi.fn()

    AutoAsyncTask.addTask(() => {
      AutoAsyncTask.addTask(task2)
      task1()
    })

    await (AutoAsyncTask as any).promise

    expect(task1).toHaveBeenCalled()
    expect(task2).not.toHaveBeenCalled()

    setTimeout(() => {
      expect(task2).toHaveBeenCalled()
    })
  })
})

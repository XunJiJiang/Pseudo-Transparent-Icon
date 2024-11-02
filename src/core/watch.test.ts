/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from 'vitest'
import { ref } from './ref'
import { reactive } from './reactive'
import { watch } from './watch'
import { AutoAsyncTask, nextTick } from './utils/AutoAsyncTask'
import { wait } from '../../tests/utils/wait'

describe('watch', () => {
  it('观察引用并使用新值和旧值调用回调', () => {
    const source = ref(0)
    const callback = vi.fn()

    watch(source, callback, {
      flush: 'sync'
    })

    source.value = 1

    expect(callback).toHaveBeenCalledWith(1, 0, expect.any(Function))
  })

  it('观察 getter 函数并使用新值和旧值调用回调', async () => {
    const callback = vi.fn()
    const state = reactive({ count: 0 })
    watch(() => state.count, callback)

    state.count = 1

    nextTick(() => {
      expect(callback).toHaveBeenCalledWith(1, 0, expect.any(Function))
    })

    await (AutoAsyncTask as any).promise
  })

  it('观察源数组并使用新值和旧值调用回调', async () => {
    const source1 = ref(0)
    const source2 = ref(1)
    const callback = vi.fn()

    watch([source1, source2], callback)

    source1.value = 2
    source2.value = 3

    nextTick(() => {
      expect(callback).toHaveBeenCalledWith(
        [2, 3],
        [0, 1],
        expect.any(Function)
      )
    })

    await (AutoAsyncTask as any).promise
  })

  it('深度观察', () => {
    const source = ref({ nested: { value: 0 } })
    const callback = vi.fn()

    watch(source, callback, { deep: true })

    source.value.nested.value = 1

    nextTick(() => {
      expect(callback).toHaveBeenCalledWith(
        { nested: { value: 1 } },
        { nested: { value: 0 } },
        expect.any(Function)
      )
    })
  })

  it('深度观察对象', async () => {
    const source = ref({
      nested: {
        nested: {
          nested: {
            nested: {
              nested: {
                value: 0
              }
            }
          }
        }
      }
    })
    const callback = vi.fn()

    watch(source, callback, { deep: true })

    source.value.nested.nested.nested.nested.nested.value = 1

    await wait()

    expect(callback).toHaveBeenCalledWith(
      {
        nested: {
          nested: {
            nested: {
              nested: {
                nested: {
                  value: 1
                }
              }
            }
          }
        }
      },
      {
        nested: {
          nested: {
            nested: {
              nested: {
                nested: {
                  value: 0
                }
              }
            }
          }
        }
      },
      expect.any(Function)
    )
  })

  it('深度观察数组', async () => {
    const source = ref([{ value: 0 }])
    const callback = vi.fn()

    watch(source, callback, { deep: true })

    source.value[0].value = 1

    await wait()

    expect(callback).toHaveBeenCalledWith(
      [{ value: 1 }],
      [{ value: 0 }],
      expect.any(Function)
    )
  })

  it('单层深度观察', async () => {
    const source = reactive({
      value: 0,
      nested: {
        value: 0
      }
    })
    const callback = vi.fn()

    watch(source, callback, { deep: 1 })

    source.nested.value = 1
    source.value = 1

    await wait()

    expect(callback).toHaveBeenCalledWith(
      {
        value: 1,
        nested: {
          value: 1
        }
      },
      {
        value: 0,
        nested: {
          value: 1
        }
      },
      expect.any(Function)
    )
  })

  it('2层深度下同时观察三种类型的源', async () => {
    const source1 = ref({ value: 0 })
    const source2 = reactive<{
      value:
        | {
            nested: {
              value: number
            }
          }
        | number
    }>({ value: 0 })
    const source3 = reactive({
      value: 0
    })
    const source4 = vi.fn()
    source4.mockReturnValue(source3)
    const callback = vi.fn()

    watch([source1, source2, source4], callback, { deep: 2 })

    source1.value.value = 1
    source2.value = {
      nested: {
        value: 1
      }
    }
    source3.value = 1

    await wait()

    expect(callback).toHaveBeenCalledWith(
      [
        {
          value: 1
        },
        {
          value: {
            nested: {
              value: 1
            }
          }
        },
        {
          value: 1
        }
      ],
      [
        {
          value: 0
        },
        {
          value: 0
        },
        {
          value: 0
        }
      ],
      expect.any(Function)
    )

    source2.value.nested.value = 2

    await wait()

    expect(callback).toHaveBeenCalledWith(
      [
        {
          value: 1
        },
        {
          value: {
            nested: {
              value: 2
            }
          }
        },
        {
          value: 1
        }
      ],
      [
        {
          value: 1
        },
        {
          value: {
            nested: {
              value: 2
            }
          }
        },
        {
          value: 1
        }
      ],
      expect.any(Function)
    )
  })
})

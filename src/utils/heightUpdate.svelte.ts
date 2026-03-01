/**
 * 虽然可以使用 ResizeObserver 来监听组件中高度可变部分的高度变化
 * 为了防止在某些场景下, 可能触发频繁的高度变化事件, 导致性能问题, 因此设置了防抖
 * 这导致可能会出现高度更新不及时的问题
 * 为了对不会频繁触发高度变化事件的场景进行优化, 提供 publishHeightUpdate 用于立刻响应高度更新事件
 */

import { debounce } from 'es-toolkit'
import type { EventBus } from './eventBus'

/**
 * @param eventBus 事件总线实例, 用于订阅和发布高度更新事件
 * @param depth 当前组件的深度, 根组件深度为 0
 * @param getRenderState 获取当前组件中高度可变部分的内容的渲染状态(是否渲染了内容), 用于判断子组件是首次渲染还是更新高度
 * @param recalculateHeight 重新计算当前组件的高度, 参数为可选对象, 包含 height 和 changeHeight 两个可选属性, height 表示当前组件可变高度部分的最新高度, changeHeight 表示当前组件可变高度部分的高度变化值
 * @param getHeightContainer 获取高度容器, 这个容器的高度必须完全由内部元素的高度决定, 如果没有这个容器, 则传入 null 或者不传入
 * @returns
 */
export function useHeightUpdateSubscriber(
  eventBus: EventBus,
  depth: number,
  /**
   * 获取当前组件中高度可变部分的内容的渲染状态(是否渲染了内容), 用于判断子组件是首次渲染还是更新高度
   */
  getRenderState: () => boolean,
  recalculateHeight: (info?: { height?: number; changeHeight?: number }) => void,
  getHeightContainer?: (() => HTMLElement | null | undefined) | null | undefined
) {
  /** 当前组件可变高度部分的高度 */
  let currentHeight = 0
  /** 定时器 ID, 用于清除定时器 */
  let interval: number
  /** 子组件高度变化时的上次的内容渲染状态*/
  let lastIsRender: boolean
  /** 设置为 true 时, 标记本次高度更新由子组件主动触发, 不需要 ResizeObserver 处理 */
  let activeUpdate = false
  let activeUpdateTimeout: number
  // 如果上次为关闭, 本次为开启, 说明子组件首次渲染
  // 此时若子组件的建议高度更新延时(timeout)为 0, 说明子组件是通过设置 auto 来立刻获取高度
  // 由于当前组件此时通过设置 auto 来获取高度, 此时获取到的高度就是子组件为 auto 时的高度, 即正确的高度
  // 此时可以直接使用这个高度来设置当前组件的高度
  // 如果上次为开启, 本次为开启, 说明子组件更新了高度
  // 此时当前组件没有触发过设置 auto 来获取高度, 获取到的高度不正确, 需要通过 changeHeight 来增量更新当前组件的高度
  $effect(() => {
    // 监听来自子组件的高度更新事件, 参数为子组件的深度
    const unlisten = eventBus.subscribe(
      `height-update`,
      (_depth: number, changeHeight?: number, timeout = 0, times = 1) => {
        if (timeout > 0) {
          console.warn('延迟高度更新建议由组件自带的 ResizeObserver 来触发')
        }

        if (_depth !== depth + 1) {
          return
        }

        const render = getRenderState()

        // 如果上次为关闭, 本次为开启, 说明子组件首次渲染
        // 此时若子组件的建议高度更新延时(timeout)为 0, 说明子组件是通过设置 auto 来立刻获取高度
        // 由于当前组件此时通过设置 auto 来获取高度, 此时获取到的高度就是子组件为 auto 时的高度, 即正确的高度
        // 此时不需要通过 changeHeight 来增量更新当前组件的高度
        if (lastIsRender !== true && render && timeout === 0) {
          lastIsRender = true
          return
        }

        clearInterval(interval)

        // 如果 changeHeight 已经提供, 说明子组件已经计算出了高度变化值, 可以直接使用这个值来更新当前组件的高度, 而不需要等待 ResizeObserver 的回调
        if (changeHeight !== void 0) {
          clearTimeout(activeUpdateTimeout)
          activeUpdate = true
          activeUpdateTimeout = setTimeout(() => {
            activeUpdate = false
          }, 300)
          recalculateHeight({ changeHeight })
          if (depth > 0) {
            eventBus.publish(`height-update`, depth, changeHeight, timeout, times)
          }
          return
        }

        if (times <= 0) {
          times = 1
        }

        /** 单次延时 */
        const singleTimeout = timeout / times

        /** 已经执行次数 */
        let executedTimes = 0

        interval = setInterval(() => {
          clearTimeout(activeUpdateTimeout)
          activeUpdate = true
          activeUpdateTimeout = setTimeout(() => {
            activeUpdate = false
          }, 300)
          recalculateHeight()
          executedTimes++
          if (depth > 0) {
            eventBus.publish(`height-update`, depth, changeHeight, 300, 2)
          }
          if (executedTimes >= times) {
            clearInterval(interval)
            if (depth > 0) {
              eventBus.publish(`height-update`, depth, changeHeight, 300, 2)
            }
          }
        }, singleTimeout)
      }
    )

    return unlisten
  })

  function publishHeightUpdate(changeHeight?: number) {
    if (depth > 0) {
      eventBus.publish(`height-update`, depth, changeHeight, 0, 1)
    }
  }

  // BUG: 当正在过渡过程中时又发生了高度变化, 可能会导致过渡结束时高度设置不正确
  // 目前的解决方案是, 在所有过渡结束后再进行一次高度更新, 确保高度设置正确
  // 因为元素过渡由 recalculateHeight 函数触发, 时常为 300ms
  // 因此设置一个防抖在最后触发一次高度更新, 确保在过渡结束后进行一次高度更新, 确保高度设置正确
  // 这只能一定程度上缓解问题, 无法完全解决问题, 依然有可能出现高度设置不正确的情况
  const debouncedRecalculateHeight = debounce(
    (height: number) => {
      console.log('debouncedRecalculateHeight', height)
      recalculateHeight()
    },
    500,
    { edges: ['trailing'] }
  )

  const debouncedPublishHeightUpdate = debounce(
    (entry: ResizeObserverEntry) => {
      const newHeight =
        entry.contentRect.height +
        (parseFloat(getComputedStyle(entry.target).paddingTop) || 0) +
        (parseFloat(getComputedStyle(entry.target).paddingBottom) || 0) +
        (parseFloat(getComputedStyle(entry.target).borderTopWidth) || 0) +
        (parseFloat(getComputedStyle(entry.target).borderBottomWidth) || 0) +
        (parseFloat(getComputedStyle(entry.target).marginTop) || 0) +
        (parseFloat(getComputedStyle(entry.target).marginBottom) || 0)
      const oldHeight = currentHeight
      if (newHeight === oldHeight) {
        return
      }
      const change = newHeight - oldHeight
      if (newHeight) {
        recalculateHeight({ height: newHeight })
        publishHeightUpdate(change)
        debouncedRecalculateHeight(newHeight)
      }
    },
    30,
    { edges: ['trailing'] }
  )

  const resizeObserver = new ResizeObserver((entries) => {
    // 如果 activeUpdate 为 true, 表示本次高度更新是由子组件主动触发的, 不需要 ResizeObserver 处理
    if (activeUpdate) {
      return
    }
    const mainContentElement = getHeightContainer ? getHeightContainer() : null
    if (!mainContentElement) {
      return
    }
    for (const entry of entries) {
      if (entry.target === mainContentElement) {
        debouncedPublishHeightUpdate(entry)
      }
    }
  })

  /** 定时标志, 在元素进入页面时, 重新观察元素 */
  let reObserveTimeout: number
  // 监听当前组件中高度可变部分的内容的渲染状态变化, 来决定是否观察元素的高度变化
  $effect(() => {
    const mainContentElement = getHeightContainer ? getHeightContainer() : null
    const open = getRenderState()
    if (!mainContentElement || !resizeObserver) {
      return
    }
    if (open) {
      reObserveTimeout = setTimeout(() => {
        resizeObserver.observe(mainContentElement)
      }, 50)
    }
    return () => {
      resizeObserver.unobserve(mainContentElement)
      clearTimeout(reObserveTimeout)
    }
  })

  return {
    publishHeightUpdate,
    getLastIsRender() {
      return lastIsRender
    },
    setLastIsRender(value: boolean) {
      lastIsRender = value
    },
    getCurrentHeight() {
      return currentHeight
    },
    /**
     * 设置当前组件可变高度部分的高度
     */
    setCurrentHeight(height: number) {
      currentHeight = height
    }
  }
}

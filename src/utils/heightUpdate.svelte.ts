import type { EventBus } from './eventBus'

/**
 *
 * @param eventBus 事件总线实例，用于订阅和发布高度更新事件
 * @param depth 当前组件的深度，根组件深度为 0
 * @param getRenderState 获取当前组件中高度可变部分的内容的渲染状态(是否渲染了内容)，用于判断子组件是首次渲染还是更新高度
 * @param recalculateHeight 重新计算当前组件的高度，参数为可选对象，包含 height 和 changeHeight 两个可选属性，height 表示当前组件可变高度部分的最新高度，changeHeight 表示当前组件可变高度部分的高度变化值
 * @returns
 */
export function useHeightUpdateSubscriber(
  eventBus: EventBus,
  depth: number,
  /**
   * 获取当前组件中高度可变部分的内容的渲染状态(是否渲染了内容)，用于判断子组件是首次渲染还是更新高度
   */
  getRenderState: () => boolean,
  recalculateHeight: (info?: { height?: number; changeHeight?: number }) => void
) {
  /** 当前组件可变高度部分的高度 */
  let currentHeight = 0

  /** 定时器 ID，用于清除定时器 */
  let interval: number

  /** 子组件高度变化时的上次的内容渲染状态*/
  let lastIsRender: boolean
  // 如果上次为关闭, 本次为开启, 说明子组件首次渲染
  // 此时若子组件的建议高度更新延时(timeout)为 0, 说明子组件是通过设置 auto 来立刻获取高度
  // 由于当前组件此时通过设置 auto 来获取高度, 此时获取到的高度就是子组件为 auto 时的高度, 即正确的高度
  // 此时可以直接使用这个高度来设置当前组件的高度
  // 如果上次为开启, 本次为开启, 说明子组件更新了高度
  // 此时当前组件没有触发过设置 auto 来获取高度, 获取到的高度不正确, 需要通过 changeHeight 来增量更新当前组件的高度

  $effect(() => {
    // 监听来自子组件的高度更新事件，参数为子组件的深度
    const unlisten = eventBus.subscribe(
      `height-update`,
      (_depth: number, changeHeight?: number, timeout = 300, times = 1) => {
        if (_depth !== depth + 1) {
          return
        }

        const render = getRenderState()

        if (lastIsRender !== true && render && timeout === 0) {
          lastIsRender = true
          return
        }

        clearInterval(interval)

        if (changeHeight !== void 0) {
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
          recalculateHeight()
          executedTimes++
          console.count('recalculateHeight called')
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

  return {
    publishHeightUpdate(changeHeight?: number) {
      eventBus.publish(`height-update`, depth, changeHeight, 0, 1)
    },
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

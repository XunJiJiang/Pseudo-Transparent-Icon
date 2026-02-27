import type { ClassValue } from 'svelte/elements'

export const useTransition = (
  getCollapseElement: () => HTMLElement | undefined,
  getVisible: () => boolean
  // getIsLast: () => boolean
) => {
  /** 过渡时常 */
  const DURATIONS = {
    '0': 'duration-0',
    '300': 'duration-300',
    '500': 'duration-500',
    '1000': 'duration-1000'
  }

  /** 常规过渡时常 */
  const NORMAL_DURATION = 300

  /** 记录上次执行进出过渡效果时 visible 的值 */
  let oldVisible: boolean
  // let oldIsLast: boolean

  /** timeouts */
  const timeouts = $state<number[]>([])

  const state = $state({
    /** 过渡时常 */
    transitionDuration: DURATIONS['300'],
    /** 透明 */
    opacity: true,
    /** 过渡效果的 class */
    class: [] as ClassValue[],
    /** 过渡动画是否结束 */
    finished: true
  })

  // 执行进出过渡效果
  $effect(() => {
    console.log('execute transition effect')
    const collapseElement = getCollapseElement()
    const visible = getVisible()

    /** 是否出现高度变化 */
    let heightChanged = false

    if (visible !== oldVisible) {
      timeouts.forEach((id) => window.clearTimeout(id))

      if (visible) {
        if (collapseElement) {
          collapseElement.style.position = ''
        }
        if (oldVisible === void 0) {
          // 初始渲染就显示，仅淡入
          state.transitionDuration = DURATIONS['0']
          state.opacity = false
          requestAnimationFrame(() => {
            state.transitionDuration = DURATIONS[NORMAL_DURATION]
            state.opacity = true
          })
        } else {
          // if (isLast) {
          // } else {
          // 淡入并向下展开
          if (!collapseElement) {
            state.opacity = true
            return
          }
          state.transitionDuration = DURATIONS['0']
          state.opacity = false
          // 获取当前元素的高度、外边距、内边距和边框宽度，并将其设置为行内样式
          const nowHeight = collapseElement.offsetHeight
          const nowMarginTop = parseFloat(getComputedStyle(collapseElement).marginTop)
          const nowMarginBottom = parseFloat(getComputedStyle(collapseElement).marginBottom)
          const nowPaddingTop = parseFloat(getComputedStyle(collapseElement).paddingTop)
          const nowPaddingBottom = parseFloat(getComputedStyle(collapseElement).paddingBottom)
          const nowBorderTopWidth = parseFloat(getComputedStyle(collapseElement).borderTopWidth)
          const nowBorderBottomWidth = parseFloat(
            getComputedStyle(collapseElement).borderBottomWidth
          )
          // 设置为 0，准备获取过渡到的目标高度
          collapseElement.style.height = 'auto'
          collapseElement.style.marginTop = ''
          collapseElement.style.marginBottom = ''
          collapseElement.style.paddingTop = ''
          collapseElement.style.paddingBottom = ''
          collapseElement.style.borderTopWidth = ''
          collapseElement.style.borderBottomWidth = ''
          requestAnimationFrame(() => {
            // 获取过渡到的目标高度、外边距、内边距和边框宽度，并将当前高度设置为 0，准备过渡
            const height = collapseElement.offsetHeight
            const marginTop = parseFloat(getComputedStyle(collapseElement).marginTop)
            const marginBottom = parseFloat(getComputedStyle(collapseElement).marginBottom)
            const paddingTop = parseFloat(getComputedStyle(collapseElement).paddingTop)
            const paddingBottom = parseFloat(getComputedStyle(collapseElement).paddingBottom)
            const borderTopWidth = parseFloat(getComputedStyle(collapseElement).borderTopWidth)
            const borderBottomWidth = parseFloat(
              getComputedStyle(collapseElement).borderBottomWidth
            )
            // 设置为过渡的初始状态
            collapseElement.style.height = `${nowHeight}px`
            collapseElement.style.marginTop = `${nowMarginTop}px`
            collapseElement.style.marginBottom = `${nowMarginBottom}px`
            collapseElement.style.paddingTop = `${nowPaddingTop}px`
            collapseElement.style.paddingBottom = `${nowPaddingBottom}px`
            collapseElement.style.borderTopWidth = `${nowBorderTopWidth}px`
            collapseElement.style.borderBottomWidth = `${nowBorderBottomWidth}px`

            requestAnimationFrame(() => {
              state.transitionDuration = DURATIONS[NORMAL_DURATION]
              requestAnimationFrame(() => {
                // 设置为过渡的目标状态
                state.opacity = true
                collapseElement.style.height = `${height}px`
                collapseElement.style.marginTop = `${marginTop}px`
                collapseElement.style.marginBottom = `${marginBottom}px`
                collapseElement.style.paddingTop = `${paddingTop}px`
                collapseElement.style.paddingBottom = `${paddingBottom}px`
                collapseElement.style.borderTopWidth = `${borderTopWidth}px`
                collapseElement.style.borderBottomWidth = `${borderBottomWidth}px`

                timeouts.push(
                  setTimeout(() => {
                    state.transitionDuration = DURATIONS['0']
                    // requestAnimationFrame(() => {
                    collapseElement.style.height = ''
                    collapseElement.style.marginTop = ''
                    collapseElement.style.marginBottom = ''
                    collapseElement.style.paddingTop = ''
                    collapseElement.style.paddingBottom = ''
                    collapseElement.style.borderTopWidth = ''
                    collapseElement.style.borderBottomWidth = ''
                    requestAnimationFrame(() => {
                      state.transitionDuration = DURATIONS[NORMAL_DURATION]
                    })
                    // })
                  }, NORMAL_DURATION)
                )
              })
            })
          })

          heightChanged = true
          state.finished = false
          timeouts.push(
            setTimeout(() => {
              state.finished = true
              state.transitionDuration = DURATIONS['0']
              state.class = [
                'transition-[opacity,transform,translate,scale,rotate,height,border,margin,padding,border-radius] overflow-hidden',
                `${state.transitionDuration}`,
                {
                  'pointer-events-none': false,
                  'opacity-0': !state.opacity,
                  'opacity-100': state.opacity,
                  'ease-[cubic-bezier(.26,.87,.26,1)]': heightChanged
                }
              ]
            }, NORMAL_DURATION)
          )
          // }
        }
      } else {
        // 隐藏，淡出并向上收起
        if (!collapseElement) {
          state.opacity = false
          return
        }
        if (oldVisible === void 0) {
          // 初始渲染就隐藏，没有过渡
          state.transitionDuration = DURATIONS['0']
          // 不可见时脱离文档流，防止占位
          collapseElement.style.position = 'absolute'
        } else {
          state.transitionDuration = DURATIONS[NORMAL_DURATION]
          // 不可见时脱离文档流，防止占位
          timeouts.push(
            setTimeout(() => {
              if (collapseElement) {
                collapseElement.style.position = 'absolute'
              }
            }, NORMAL_DURATION)
          )
        }
        state.opacity = false

        // if (!isLast) {
        const height = collapseElement.offsetHeight
        const marginTop = parseFloat(getComputedStyle(collapseElement).marginTop)
        const marginBottom = parseFloat(getComputedStyle(collapseElement).marginBottom)
        const paddingTop = parseFloat(getComputedStyle(collapseElement).paddingTop)
        const paddingBottom = parseFloat(getComputedStyle(collapseElement).paddingBottom)
        const borderTopWidth = parseFloat(getComputedStyle(collapseElement).borderTopWidth)
        const borderBottomWidth = parseFloat(getComputedStyle(collapseElement).borderBottomWidth)
        collapseElement.style.height = `${height}px`
        collapseElement.style.marginTop = `${marginTop}px`
        collapseElement.style.marginBottom = `${marginBottom}px`
        collapseElement.style.paddingTop = `${paddingTop}px`
        collapseElement.style.paddingBottom = `${paddingBottom}px`
        collapseElement.style.borderTopWidth = `${borderTopWidth}px`
        collapseElement.style.borderBottomWidth = `${borderBottomWidth}px`
        requestAnimationFrame(() => {
          state.transitionDuration = DURATIONS[NORMAL_DURATION]
          requestAnimationFrame(() => {
            collapseElement.style.height = '0'
            collapseElement.style.marginTop = '0'
            collapseElement.style.marginBottom = '0'
            collapseElement.style.paddingTop = '0'
            collapseElement.style.paddingBottom = '0'
            collapseElement.style.borderTopWidth = '0'
            collapseElement.style.borderBottomWidth = '0'
          })
        })

        heightChanged = true
        state.finished = false
        timeouts.push(
          setTimeout(() => {
            state.finished = true
            state.transitionDuration = DURATIONS['0']
            state.class = [
              'transition-[opacity,transform,translate,scale,rotate,height,border,margin,padding,border-radius] overflow-hidden',
              `${state.transitionDuration}`,
              {
                'pointer-events-none': visible === false,
                'opacity-0': !state.opacity,
                'opacity-100': state.opacity,
                'ease-[cubic-bezier(.26,.87,.26,1)]': heightChanged
              }
            ]
          }, NORMAL_DURATION)
        )
        // }
      }

      oldVisible = visible
    }

    state.class = [
      'transition-[opacity,transform,translate,scale,rotate,height,border,margin,padding,border-radius] overflow-hidden',
      `${state.transitionDuration}`,
      {
        'pointer-events-none': visible === false,
        'opacity-0': !state.opacity,
        'opacity-100': state.opacity,
        'ease-[cubic-bezier(.26,.87,.26,1)]': heightChanged
      }
    ]
  })

  return state
}

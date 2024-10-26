/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Func } from '@type/function'

// #region Description
export type EventHandlers =
  | 'beforeinstallprompt'
  | 'beforexrselect'
  | 'abort'
  | 'beforeinput'
  | 'beforematch'
  | 'beforetoggle'
  | 'blur'
  | 'cancel'
  | 'canplay'
  | 'canplaythrough'
  | 'change'
  | 'click'
  | 'close'
  | 'contentvisibilityautostatechange'
  | 'contextlost'
  | 'contextmenu'
  | 'contextrestored'
  | 'cuechange'
  | 'dblclick'
  | 'drag'
  | 'dragend'
  | 'dragenter'
  | 'dragleave'
  | 'dragover'
  | 'dragstart'
  | 'drop'
  | 'durationchange'
  | 'emptied'
  | 'ended'
  | 'error'
  | 'focus'
  | 'formdata'
  | 'input'
  | 'invalid'
  | 'keydown'
  | 'keypress'
  | 'keyup'
  | 'load'
  | 'loadeddata'
  | 'loadedmetadata'
  | 'loadstart'
  | 'mousedown'
  | 'mouseenter'
  | 'mouseleave'
  | 'mousemove'
  | 'mouseout'
  | 'mouseover'
  | 'mouseup'
  | 'mousewheel'
  | 'pause'
  | 'play'
  | 'playing'
  | 'progress'
  | 'ratechange'
  | 'reset'
  | 'resize'
  | 'scroll'
  | 'securitypolicyviolation'
  | 'seeked'
  | 'seeking'
  | 'select'
  | 'slotchange'
  | 'stalled'
  | 'submit'
  | 'suspend'
  | 'timeupdate'
  | 'toggle'
  | 'volumechange'
  | 'waiting'
  | 'webkitanimationend'
  | 'webkitanimationiteration'
  | 'webkitanimationstart'
  | 'webkittransitionend'
  | 'wheel'
  | 'auxclick'
  | 'gotpointercapture'
  | 'lostpointercapture'
  | 'pointerdown'
  | 'pointermove'
  | 'pointerrawupdate'
  | 'pointerup'
  | 'pointercancel'
  | 'pointerover'
  | 'pointerout'
  | 'pointerenter'
  | 'pointerleave'
  | 'selectstart'
  | 'selectionchange'
  | 'animationend'
  | 'animationiteration'
  | 'animationstart'
  | 'transitionrun'
  | 'transitionstart'
  | 'transitionend'
  | 'transitioncancel'
  | 'afterprint'
  | 'beforeprint'
  | 'beforeunload'
  | 'hashchange'
  | 'languagechange'
  | 'message'
  | 'messageerror'
  | 'offline'
  | 'online'
  | 'pagehide'
  | 'pageshow'
  | 'popstate'
  | 'rejectionhandled'
  | 'storage'
  | 'unhandledrejection'
  | 'unload'
  | 'devicemotion'
  | 'deviceorientation'
  | 'deviceorientationabsolute'
  | 'pageswap'
  | 'pagereveal'
  | 'scrollend'

const events = [
  'search',
  'appinstalled',
  'beforeinstallprompt',
  'beforexrselect',
  'abort',
  'beforeinput',
  'beforematch',
  'beforetoggle',
  'blur',
  'cancel',
  'canplay',
  'canplaythrough',
  'change',
  'click',
  'close',
  'contentvisibilityautostatechange',
  'contextlost',
  'contextmenu',
  'contextrestored',
  'cuechange',
  'dblclick',
  'drag',
  'dragend',
  'dragenter',
  'dragleave',
  'dragover',
  'dragstart',
  'drop',
  'durationchange',
  'emptied',
  'ended',
  'error',
  'focus',
  'formdata',
  'input',
  'invalid',
  'keydown',
  'keypress',
  'keyup',
  'load',
  'loadeddata',
  'loadedmetadata',
  'loadstart',
  'mousedown',
  'mouseenter',
  'mouseleave',
  'mousemove',
  'mouseout',
  'mouseover',
  'mouseup',
  'mousewheel',
  'pause',
  'play',
  'playing',
  'progress',
  'ratechange',
  'reset',
  'resize',
  'scroll',
  'securitypolicyviolation',
  'seeked',
  'seeking',
  'select',
  'slotchange',
  'stalled',
  'submit',
  'suspend',
  'timeupdate',
  'toggle',
  'volumechange',
  'waiting',
  'webkitanimationend',
  'webkitanimationiteration',
  'webkitanimationstart',
  'webkittransitionend',
  'wheel',
  'auxclick',
  'gotpointercapture',
  'lostpointercapture',
  'pointerdown',
  'pointermove',
  'pointerrawupdate',
  'pointerup',
  'pointercancel',
  'pointerover',
  'pointerout',
  'pointerenter',
  'pointerleave',
  'selectstart',
  'selectionchange',
  'animationend',
  'animationiteration',
  'animationstart',
  'transitionrun',
  'transitionstart',
  'transitionend',
  'transitioncancel',
  'afterprint',
  'beforeprint',
  'beforeunload',
  'hashchange',
  'languagechange',
  'message',
  'messageerror',
  'offline',
  'online',
  'pagehide',
  'pageshow',
  'popstate',
  'rejectionhandled',
  'storage',
  'unhandledrejection',
  'unload',
  'devicemotion',
  'deviceorientation',
  'deviceorientationabsolute',
  'pageswap',
  'pagereveal',
  'scrollend'
] as EventHandlers[]
// #endregion

/** 放置外部调用clearRef的标识 */
export const SYMBOL_CLEAR_REF = Symbol('clearRef')

export type EventListeners = {
  listener: EventListener
  handles: EventListener[]
}

export default class BaseElement extends HTMLElement {
  static events = events

  get obAttr(): string[] {
    return []
  }

  /** 整合observedAttributes和从父组件获取的数据 */
  $props: Record<string, any> = {}

  /** 当前组件给原生生命周期事件共享的数据 */
  $sharedData: Record<string, any> = {}

  /** 当使用createElement创建dom时，将参数中的属性赋予此处 */
  $propData: Record<string, any> = {}

  /** 当使用createElement创建dom时，将参数中的事件赋予此处 */
  $emitMethods: Record<string, Func> = {}

  /** 影子 DOM 根 */
  $root: ShadowRoot | BaseElement = this.attachShadow({ mode: 'open' })

  /** 当前组件暴露给父组件的属性 */
  $exposedData: Record<string, any> = {}

  /** 模板中声明了 expose 的元素 */
  $defineExposes: Record<string, Record<string, any>> = {}

  /** setup 函数中 使用 exposeTemplate 声明的元素 */
  $exposes: Record<string, { value: Record<string, any> | null }> = {}

  /** 模板中声明了 ref 的元素 */
  $defineRefs: Record<string, Element> = {}

  /** setup 函数中 使用 refTemplate 声明的元素 */
  $refs: Record<string, { value: Element | null }> = {}

  /** 父组件 */
  $parentComponent: BaseElement | null = null

  constructor() {
    super()
  }

  __destroy__(symbol: typeof SYMBOL_CLEAR_REF) {
    if (symbol !== SYMBOL_CLEAR_REF) {
      /*@__PURE__*/ console.error(
        `${this.localName}: __destroy__方法只能由xj-web内部调用。`
      )
      return false
    }

    const shadow = this.$root

    Array.from(shadow.querySelectorAll('*')).forEach((child) => {
      if (child instanceof BaseElement) {
        child.__destroy__(SYMBOL_CLEAR_REF)
      }
    })

    this.$props = {}
    this.$sharedData = {}

    for (const key in this.$exposedData) {
      delete this.$exposedData[key]
    }
    this.$exposedData = {}

    this.$defineExposes = {}
    for (const key in this.$exposes) {
      this.$exposes[key].value = null
    }
    this.$exposes = {}

    this.$defineRefs = {}
    for (const key in this.$refs) {
      this.$refs[key].value = null
    }
    this.$refs = {}

    this.$parentComponent = null

    return true
  }
}

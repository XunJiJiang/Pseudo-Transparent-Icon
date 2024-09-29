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

export default class BaseElement extends HTMLElement {
  static events = events

  /** 整合observedAttributes和从父组件获取的数据(由x-开头的属性所得) */
  $props: Record<string, any> = {}

  /** 当前组件暴露给子组件的数据 */
  $data: Record<string, any> = {}

  /** 当前组件暴露给子组件的方法 */
  $methods: Record<string, Func> = {}

  /** 当前组件暴露给父组件的属性 */
  $exposeAttributes: Record<string, any> = {}

  /** 影子 DOM 根 */
  $root: ShadowRoot | BaseElement | null = null

  /** 模板中声明了 expose 的元素 */
  $defineExposes: Record<string, Record<string, any> | null> = {}

  /** setup 函数中 使用 exposeTemplate 声明的元素 */
  $exposes: Record<string, { value: Record<string, any> | null }> = {}

  /** 模板中声明了 ref 的元素 */
  $defineRefs: Record<string, Element | null> = {}

  /** setup 函数中 使用 refTemplate 声明的元素 */
  $refs: Record<string, { value: Element | null }> = {}

  constructor() {
    super()
  }
}

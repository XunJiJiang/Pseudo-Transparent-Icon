import { type Func } from '@type/function'

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

export default class BaseElement extends HTMLElement {
  static events = events

  $props: Record<string, unknown> = {}

  $data: Record<string, unknown> = {}

  $methods: Record<string, Func> = {}

  $exposeAttributes: Record<string, unknown> = {}

  /** 影子 DOM 根 */
  $shadowRoot = this.attachShadow({ mode: 'open' })

  /** 模板中声明了 ref 的元素 */
  $defineRefs: Record<string, Element | null> = {}

  /** setup 函数中 使用 refTemplate 声明的元素 */
  $refs: Record<string, { value: Element | null }> = {}

  constructor() {
    super()
  }
}

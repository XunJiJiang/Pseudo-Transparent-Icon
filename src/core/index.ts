import { onBeforeMount } from './hooks/lifecycle/beforeMount'

import { onMounted } from './hooks/lifecycle/mounted'

import { onUnmounted } from './hooks/lifecycle/unmounted'

import { ref, isRef } from './reactive/ref'

import { reactive } from './reactive/reactive'

import { isReactive } from './reactive/Dependency'

import { effect } from './reactive/effect'

import { watch } from './reactive/watch'

import { defineCustomElement } from './dom/defineElement'

import { nextTick } from './utils/AutoAsyncTask'

import { default as useId } from './hooks/useId'

import { isHTMLElement } from './utils/shared'

import { createElement } from './dom/createElement'

import { __jsx, h, Fragment } from './dom/jsx'

export default {
  onBeforeMount,
  onMounted,
  onUnmounted,
  ref,
  isRef,
  reactive,
  isReactive,
  effect,
  watch,
  defineCustomElement,
  nextTick,
  useId,
  isHTMLElement,
  createElement,
  __jsx,
  h,
  Fragment
}

export {
  onBeforeMount,
  onMounted,
  onUnmounted,
  ref,
  isRef,
  reactive,
  isReactive,
  effect,
  watch,
  defineCustomElement,
  nextTick,
  useId,
  isHTMLElement,
  createElement,
  __jsx,
  h,
  Fragment
}

import { onBeforeMount } from './hooks/lifecycle/beforeMount'

import { onMounted } from './hooks/lifecycle/mounted'

import { onUnmounted } from './hooks/lifecycle/unmounted'

import { ref, isRef } from './ref'

import { reactive } from './reactive'

import { isReactive } from './Dependency'

import { effect } from './effect'

import { watch } from './watch'

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

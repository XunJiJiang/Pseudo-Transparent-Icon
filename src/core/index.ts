export { onBeforeCreate } from './hooks/lifecycle/beforeCreate'

export { onCreated } from './hooks/lifecycle/created'

export { onBeforeMount } from './hooks/lifecycle/beforeMount'

export { onMounted } from './hooks/lifecycle/mounted'

export { onUnmounted } from './hooks/lifecycle/unmounted'

export { default as ref } from './ref'

export { default as refTemplate } from './dom/refTemplate'

export { default as exposeTemplate } from './dom/exposeTemplate'

export { default as expose } from './dom/exposeAttributes'

export { default as reactive } from './reactive'

export { effect, isRef, isReactive } from './Dependency'

export { default as defineCustomElement } from './dom/defineElement'

export { getInstance } from './dom/fixComponentIns'

export { default as AutoAsyncTask } from './utils/AutoAsyncTask'

export { default as useId } from './hooks/useId'

export { isHTMLElement } from './utils/shared'

export { default as createElement } from './utils/createElement'

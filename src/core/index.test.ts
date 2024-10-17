/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest'
import {
  onBeforeCreate,
  onCreated,
  onBeforeMount,
  onMounted,
  onUnmounted,
  ref,
  refTemplate,
  exposeTemplate,
  expose,
  reactive,
  effect,
  isRef,
  isReactive,
  defineCustomElement,
  getInstance,
  AutoAsyncTask,
  useId,
  isHTMLElement,
  createElement
} from './index'

describe('Core Module Exports', () => {
  it('should export onBeforeCreate', () => {
    expect(onBeforeCreate).toBeDefined()
  })

  it('should export onCreated', () => {
    expect(onCreated).toBeDefined()
  })

  it('should export onBeforeMount', () => {
    expect(onBeforeMount).toBeDefined()
  })

  it('should export onMounted', () => {
    expect(onMounted).toBeDefined()
  })

  it('should export onUnmounted', () => {
    expect(onUnmounted).toBeDefined()
  })

  it('should export ref', () => {
    expect(ref).toBeDefined()
  })

  it('should export refTemplate', () => {
    expect(refTemplate).toBeDefined()
  })

  it('should export exposeTemplate', () => {
    expect(exposeTemplate).toBeDefined()
  })

  it('should export expose', () => {
    expect(expose).toBeDefined()
  })

  it('should export reactive', () => {
    expect(reactive).toBeDefined()
  })

  it('should export effect', () => {
    expect(effect).toBeDefined()
  })

  it('should export isRef', () => {
    expect(isRef).toBeDefined()
  })

  it('should export isReactive', () => {
    expect(isReactive).toBeDefined()
  })

  it('should export defineCustomElement', () => {
    expect(defineCustomElement).toBeDefined()
  })

  it('should export getInstance', () => {
    expect(getInstance).toBeDefined()
  })

  it('should export AutoAsyncTask', () => {
    expect(AutoAsyncTask).toBeDefined()
  })

  it('should export useId', () => {
    expect(useId).toBeDefined()
  })

  it('should export isHTMLElement', () => {
    expect(isHTMLElement).toBeDefined()
  })

  it('should export createElement', () => {
    expect(createElement).toBeDefined()
  })
})

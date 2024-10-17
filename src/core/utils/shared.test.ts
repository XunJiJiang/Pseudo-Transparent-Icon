/**
 * @vitest-environment jsdom
 */
import { describe, test, expect } from 'vitest'
import { isFunction, isArray, isObject, hasOwn, isHTMLElement } from './shared'

describe('shared utility functions', () => {
  test('isFunction 应该对函数返回 true', () => {
    const fn = () => {}
    expect(isFunction(fn)).toBe(true)
  })

  test('isFunction 应该对非函数返回 false', () => {
    expect(isFunction(123)).toBe(false)
    expect(isFunction('string')).toBe(false)
    expect(isFunction({})).toBe(false)
    expect(isFunction([])).toBe(false)
  })

  test('isArray 应该对数组返回 true', () => {
    expect(isArray([])).toBe(true)
    expect(isArray([1, 2, 3])).toBe(true)
  })

  test('isArray 应该对非数组返回 false', () => {
    expect(isArray(123)).toBe(false)
    expect(isArray('string')).toBe(false)
    expect(isArray({})).toBe(false)
    expect(isArray(() => {})).toBe(false)
  })

  test('isArray 应该对对象返回 true', () => {
    expect(isObject({})).toBe(true)
    expect(isObject({ a: 1 })).toBe(true)
  })

  test('isArray 应该对非对象返回 false', () => {
    expect(isObject(null)).toBe(false)
    expect(isObject(123)).toBe(false)
    expect(isObject('string')).toBe(false)
    expect(isObject([])).toBe(false)
  })

  test('hasOwn 应该对具有指定 key 属性的对象返回 true', () => {
    const obj = { a: 1 }
    expect(hasOwn(obj, 'a')).toBe(true)
  })

  test('hasOwn 应该对不具有指定 key 属性的对象返回 false', () => {
    const obj = { a: 1 }
    expect(hasOwn(obj, 'b')).toBe(false)
  })

  test('isHTMLElement 应该对 HTMLElements 返回 true', () => {
    const div = document.createElement('div')
    expect(isHTMLElement(div)).toBe(true)
  })

  test('isHTMLElement 应该对非 HTMLElements 返回 false', () => {
    expect(isHTMLElement({})).toBe(false)
    expect(isHTMLElement(null)).toBe(false)
    expect(isHTMLElement('string')).toBe(false)
  })
})

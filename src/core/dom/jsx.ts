import { type ChildType, createElement } from './createElement'
import { isArray } from '../utils/shared'

const isFragment = (tag: unknown): tag is typeof Fragment => tag === Fragment

export const Fragment = Symbol.for('x-fgt') as unknown as {
  __isFragment: true
}

export const h = (
  tag: string | typeof Fragment,
  // TODO: props type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props?: any,
  ...children: ChildType[]
): Node | Node[] => {
  function _flat(array: ChildType[]): ChildType[] {
    if (array.every((val) => !isArray(val))) {
      return array
    }
    const _array = array.flat()
    return _flat(_array)
  }
  const _children = _flat(children)

  if (isFragment(tag)) {
    return children.map((child) => {
      if (child instanceof Node) return child
      return document.createTextNode(child)
    })
  } else return createElement(tag, props ?? {}, _children ?? [])
}

export const __jsx = {
  h,
  Fragment
}

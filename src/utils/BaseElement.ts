import { type Func } from '@type/function'

export default class BaseElement extends HTMLElement {
  static events = ['click']

  props: Record<string, string | null> = {}

  data: Record<string, unknown> = {}

  $methods: Record<string, Func> = {}

  $exposeMethods: Record<string, Func> = {}

  methods: (key: string, ...args: unknown[]) => unknown = () => {}

  /** 影子 DOM 根 */
  shadowRoot = this.attachShadow({ mode: 'open' })

  /** 模板中声明了 ref 的元素 */
  $defineRefs: Record<string, Element | null> = {}

  /** setup 函数中声明了 refTemplate 的元素 */
  $refs: Record<string, { value: Element | null }> = {}

  constructor() {
    super()
  }
}

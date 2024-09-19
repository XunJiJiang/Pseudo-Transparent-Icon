// import defineEle from '@utils/defineEle'
import css from './index.scss?toJs'
import html from './index.html?toJs'

// 为这个元素创建类
export class MyCustomElement extends HTMLElement {
  // static observedAttributes = ['count']

  constructor() {
    super()
  }

  connectedCallback() {
    // 创建影子根
    const shadow = this.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.innerHTML = css
    shadow.innerHTML = html
    shadow.appendChild(style)
    // 获取全部包括on-click属性的元素
    const elements = shadow.querySelectorAll('[on-click]')
    const data = {
      count: 0
    }
    const events = {
      add(target: HTMLElement) {
        data.count++
        target.innerHTML = `count = ${data.count}`
      }
    }
    elements.forEach((ele) => {
      const target = ele as HTMLElement
      const click = target.getAttribute('on-click') as 'add'
      ele.addEventListener('click', (e) => {
        if (e.target) events[click](e.target as HTMLElement)
      })
    })
  }

  disconnectedCallback() {
    console.log('自定义元素从页面中移除。')
  }

  adoptedCallback() {
    console.log('自定义元素移动至新页面。')
  }

  // attributeChangedCallback(name, oldValue, newValue) {
  //   console.log(`属性 ${name} 已变更。`)
  // }
}

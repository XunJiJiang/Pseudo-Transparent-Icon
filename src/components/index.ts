import define from '@utils/defineEle'
// import BaseElement from '@utils/BaseElement'
import css from './index.scss?toJs'
import html from './index.html?toJs'
import effect from '@utils/effect'
import ref from '@utils/ref'
import refTemplate from '@/utils/refTemplate'

export default define('my-custom-element', {
  template: html,
  style: css,
  setup(props) {
    const count = ref(0)
    const countButton = refTemplate('count')
    const root = refTemplate('element-root')
    effect(() => {
      if (!('count' in props)) {
        if (root.value) {
          const child = document.createElement('div')
          child.setAttribute('count', '1')
          child.innerHTML = '<my-custom-element count="0"></my-custom-element>'
          root.value?.appendChild(child)
        }
      }
    })
    return {
      count,
      add() {
        if (!('count' in props)) count.value++
      },
      render() {
        if (!('count' in props)) {
          if (countButton.value)
            countButton.value.innerHTML = `count = ${count.value}`
          const child = root.value?.querySelector('my-custom-element[count]')
          if (child) {
            child.setAttribute('count', `${count.value}`)
          }
        }
      },
      update(v: string) {
        if (countButton.value) countButton.value.innerHTML = `count = ${v}`
      }
    }
  },
  observedAttributes: ['count'],
  connected(data, { methods }) {
    effect(() => {
      // this.$refs.count.value.innerHTML = `count = ${this.data.count.value}`
      methods('render')
    })
  },
  disconnected() {
    console.log('自定义元素从页面中移除。')
  },
  adopted() {
    console.log('自定义元素移动至新页面。')
  },
  attributeChanged(name, oldValue, newValue, data, { methods }) {
    methods('update', newValue)
  }
})

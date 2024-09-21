import html from './index.html?toJs'
import css from './index.scss?toJs'
import define from '@utils/defineEle'
import effect from '@utils/effect'
import { getInstance } from '@utils/fixComponentIns'
// import refTemplate from '@utils/refTemplate'

export default define('view-home', {
  template: html,
  style: css,
  setup(_, { expose }) {
    // const homeRef = refTemplate('home-ref')
    let count = 1
    effect(() => {
      setTimeout(() => {
        // console.log('view-home root', homeRef)
      })
    })
    expose({
      console() {
        console.log('view-home console', this)
      }
    })
    return {
      add() {
        const { $shadowRoot } = getInstance()
        const child = document.createElement('div')
        child.innerHTML = `<comp-page style="--top:${count++ * 60}px"></comp-page>`
        $shadowRoot.appendChild(child)
      }
    }
  }
})

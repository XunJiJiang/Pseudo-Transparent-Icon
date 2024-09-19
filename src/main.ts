import './style.scss'
import { MyCustomElement } from './components'
import html from './main.html?toJs'

customElements.define('my-custom-element', MyCustomElement)

document.querySelector<HTMLDivElement>('#app')!.innerHTML = html

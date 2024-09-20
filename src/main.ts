import './style.scss'
import define from './components'
import html from './main.html?toJs'

define()

document.querySelector<HTMLDivElement>('#app')!.innerHTML = html

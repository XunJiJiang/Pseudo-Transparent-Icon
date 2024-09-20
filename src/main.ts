import './style.scss'
import html from './main.html?toJs'
import defineComponent from '@components/index'
import defineLayout from '@layout/index'

defineComponent()
defineLayout()

document.querySelector<HTMLDivElement>('#app')!.innerHTML = html

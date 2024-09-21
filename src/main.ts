import './style.scss'
import html from './main.html?toJs'
import defineComponent from '@components/index'
import defineLayout from '@layout/index'
import defineView from '@views/index'

defineComponent()
defineLayout()
defineView()

document.querySelector<HTMLDivElement>('#app')!.innerHTML = html

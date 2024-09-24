import './style.scss'
import html from './main.html?raw'
import defineComponent from '@components/index'
import defineLayout from '@layout/index'
import defineView from '@views/index'

defineComponent()
defineLayout()
defineView()

document.querySelector<HTMLDivElement>('#app')!.innerHTML = html

// 禁用双指缩放
document.addEventListener('gesturestart', function (event) {
  event.preventDefault()
})

import './style.scss'
import defineComponent from '@components/index'
import defineLayout from '@layout/index'
import defineView from '@views/index'
import { createApp } from 'xj-fv'

defineComponent()
defineLayout()
defineView()

createApp(document.querySelector<HTMLDivElement>('#app')!).mount(<l-index />)

// 禁用双指缩放
document.addEventListener('gesturestart', function (event) {
  event.preventDefault()
})

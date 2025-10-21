import './style.scss'
import { createApp } from 'xj-fv'
import Index from './layout/index/index'

createApp(document.querySelector<HTMLDivElement>('#app')!).mount(<Index />)

// 禁用双指缩放
document.addEventListener('gesturestart', function (event) {
  event.preventDefault()
})

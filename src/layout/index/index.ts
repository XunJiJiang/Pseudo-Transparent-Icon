import html from './index.html?raw'
import css from './index.scss?raw'
import { define, effect, reactive } from 'xj-web-core/index'

export default define('l-index', {
  template: html,
  style: css,
  setup(_, { expose }) {
    // const view = refTemplate('v-home-ref')
    const count = reactive({
      value: 0,
      test: {
        value: 0
      }
    })
    expose({
      prev() {
        // console.log('l-index prev')
        count.value++
        count.test.value++
        count.test.value++
        count.test.value++
      },
      next() {
        console.log('l-index next')
      },
      count
    })
    effect(() => {
      console.log(count.test)
      console.log('l-index setup', count.test.value)

      return () => {
        console.log('l-index cleanup')
      }
    })
  }
})

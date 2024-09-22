import sass from 'sass'
import fs from 'node:fs'

type Options = {
  scss?: {
    global?: false | string
  }
}

export default (option: Options | void) => {
  const globalScss =
    typeof option?.scss?.global === 'string'
      ? (() => {
          try {
            return fs.readFileSync(option.scss.global, 'utf-8')
          } catch (error) {
            console.error('error:', error)
            return ''
          }
        })()
      : ''
  const compileScss = (code: string) => {
    const _scss = code.replace('export default "', '').slice(0, -1).split('\\n')
    const _otherList: string[] = []
    const _importList = _scss.filter((item) => {
      if (item.startsWith('@use') || item.startsWith('@import')) {
        return true
      }
      _otherList.push(item)
      return false
    })
    const _code = sass.compileString(
      _importList.join('\n') + '\n' + globalScss + '\n' + _otherList.join('\n')
    )
    return 'export default `' + _code.css.toString() + '`'
  }
  return {
    name: 'vite-plugin-raw-after-compile',
    assetsInclude: ['**/*.*?toJs'],
    // enforce: 'pre',
    transform(code: string, id: string) {
      // 处理 ts?toJs 和 js?toJs 的引入
      if (id.endsWith('?toJs') || id.endsWith('?raw')) {
        const fileType = (
          id.split('/').pop()?.split('.').slice(1).join('.') || ''
        )
          .replace('?toJs', '')
          .replace('?raw', '')

        // TODO: 此处仅处理了 scss，可根据需求添加其他类型
        if (fileType === 'scss') {
          try {
            const result = compileScss(code)
            // TODO: 可能需要引入`@use '@assets/scss/global.scss' as *;`, 目前来看并不需要
            return {
              code: result,
              map: null
            }
          } catch (error) {
            console.error('error:', error)
          }
        }
      }
    }
  }
}

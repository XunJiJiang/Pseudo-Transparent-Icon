import { defineConfig, createFilter } from 'vite'
import path from 'node:path'
import fs from 'node:fs'
import sass from 'sass'

const alias = {
  '@': path.resolve(__dirname, 'src'),
  '@components': path.resolve(__dirname, 'src/components'),
  '@utils': path.resolve(__dirname, 'src/utils'),
  '@views': path.resolve(__dirname, 'src/views'),
  '@img': path.resolve(__dirname, 'src/assets/images'),
  '@type': path.resolve(__dirname, 'src/types'),
  '@layout': path.resolve(__dirname, 'src/layout')
}

const filterTs = createFilter('**/*.ts?toJs=*')
const filterJs = createFilter('**/*.js?toJs=*')

export default defineConfig({
  plugins: [
    // vitePluginSass(),
    {
      name: 'vite-plugin-raw-after-compile',
      transform(code, id) {
        // 处理 ts?toJs 和 js?toJs 的引入
        if (filterTs(id) || filterJs(id)) {
          const fileType = id
            .split('?')[1]
            ?.split('&')
            .filter((item) => item.includes('toJs'))[0]
            .split('=')[1]

          // 解析真实后缀
          const realPath = id.replace('ts?toJs=', '').replace('js?toJs=', '')

          // TODO: 此处仅处理了 css scss 和 html，可根据需求添加其他类型
          if (fileType === 'css') {
            try {
              const result = fs.readFileSync(realPath, 'utf-8')
              return {
                code: `const css = \`${result}\`;\n` + `export default css;`,
                map: null
              }
            } catch (error) {
              console.error('error:', error)
            }
          } else if (fileType === 'scss') {
            try {
              const result = sass.compile(realPath)
              // TODO: 可能需要引入`@use '@assets/scss/global.scss' as *;`, 目前来看并不需要
              return {
                code:
                  `const css = \`${result.css}\`;\n` + `export default css;`,
                map: null
              }
            } catch (error) {
              console.error('error:', error)
            }
          } else if (fileType === 'html') {
            try {
              const result = fs.readFileSync(realPath, 'utf-8')
              return {
                code: `const html = \`${result}\`;\n` + `export default html;`,
                map: null
              }
            } catch (error) {
              console.error('error:', error)
            }
          }
        }

        // 处理 scss?toJs 的引入
        // 将js/ts文件中的scss?toJs替换为js?toJs=scss
        if (
          code.includes('scss?toJs') ||
          code.includes('css?toJs') ||
          code.includes('html?toJs')
        ) {
          return {
            code: code
              .replace('scss?toJs', 'js?toJs=scss')
              .replace('css?toJs', 'js?toJs=css')
              .replace('html?toJs', 'js?toJs=html'),
            map: null
          }
        }
      }
    }
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/assets/scss/global.scss";'
      }
    }
  },
  resolve: {
    alias
  },
  build: {
    outDir: 'dist'
  },
  server: {
    host: true,
    port: 3000,
    open: true
  },
  preview: {
    port: 8080
  },
  base: '/pseudo-transparent-icon.io/'
})

export const viteConfig = {
  resolve: {
    alias
  }
}

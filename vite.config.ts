/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import rawAfterCompile from './vite/vite-plugin-raw-after-compile'

/*
 * NOTE: 关于 core
 * core 文件夹内的买个文件夹都被视为一个独立的模块
 * 当使用引入同一模块内的文件时, 使用相对路径
 * 当引入其他模块内的文件时, 使用别名
 */

const joinTo = (...paths: string[]) => resolve(__dirname, ...paths)

const alias = {
  // 用于外部引用
  'xj-web-core': joinTo('src/core'),
  // 用于内部引用
  core: joinTo('src/core'),
  '@': joinTo('src'),
  '@components': joinTo('src/components'),
  '@utils': joinTo('src/utils'),
  '@views': joinTo('src/views'),
  '@img': joinTo('src/assets/images'),
  '@type': joinTo('src/types'),
  '@layout': joinTo('src/layout')
}

export default defineConfig({
  plugins: [
    rawAfterCompile({
      scss: {
        global: joinTo('src/assets/scss/variable.scss')
      }
    })
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        additionalData:
          '@use "@/assets/scss/variable.scss" as *;@use "@/assets/scss/global.scss";'
      }
    }
  },
  resolve: {
    alias
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        index: joinTo('index.html'),
        404: joinTo('404.html')
      }
    }
  },
  server: {
    host: true,
    port: 3000
  },
  preview: {
    port: 8080
  },
  base: '/pseudo-transparent-icon.io/',
  test: {
    // 仅测试src/core内的文件
    coverage: {
      include: ['src/core/**'],
      exclude: ['src/core/index.ts', '**/*.test.ts']
    }
  },
  esbuild: {
    jsxFactory: '__jsx.h',
    jsxFragment: '__jsx.Fragment',
    jsxInject: `import { __jsx } from 'xj-web-core/index'`
  }
})

export const viteConfig = {
  resolve: {
    alias
  }
}

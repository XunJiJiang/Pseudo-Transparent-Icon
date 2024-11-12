/// <reference types="vitest" />
import { defineConfig } from 'vite'
import path from 'node:path'
import rawAfterCompile from './vite/vite-plugin-raw-after-compile'

/*
 * NOTE: 关于 core
 * core 文件夹内的买个文件夹都被视为一个独立的模块
 * 当使用引入同一模块内的文件时, 使用相对路径
 * 当引入其他模块内的文件时, 使用别名
 */

const alias = {
  // 用于外部引用
  'xj-web-core': path.resolve(__dirname, 'src/core'),
  // 用于内部引用
  core: path.resolve(__dirname, 'src/core'),
  '@': path.resolve(__dirname, 'src'),
  '@components': path.resolve(__dirname, 'src/components'),
  '@utils': path.resolve(__dirname, 'src/utils'),
  '@views': path.resolve(__dirname, 'src/views'),
  '@img': path.resolve(__dirname, 'src/assets/images'),
  '@type': path.resolve(__dirname, 'src/types'),
  '@layout': path.resolve(__dirname, 'src/layout')
}

export default defineConfig({
  plugins: [
    rawAfterCompile({
      scss: {
        global: path.resolve(__dirname, 'src/assets/scss/variable.scss')
      }
    })
  ],
  css: {
    preprocessorOptions: {
      scss: {
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
        index: path.resolve(__dirname, 'index.html'),
        404: path.resolve(__dirname, '404.html')
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

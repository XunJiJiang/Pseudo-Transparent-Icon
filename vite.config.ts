/// <reference types="vitest" />
import { defineConfig } from 'vite'
import path from 'node:path'
import rawAfterCompile from './vite/vite-plugin-raw-after-compile'

const alias = {
  'xj-web-core': path.resolve(__dirname, 'src/core'),
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
          '@use "@/assets/scss/variable.scss" as *;@import "@/assets/scss/global.scss";'
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
    port: 3000,
    open: true
  },
  preview: {
    port: 8080
  },
  base: '/pseudo-transparent-icon.io/',
  test: {
    // 仅测试src/core内的文件
    coverage: {
      include: ['src/core/**']
    }
  }
})

export const viteConfig = {
  resolve: {
    alias
  }
}

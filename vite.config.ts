import { defineConfig } from 'vite'
import path from 'node:path'

const alias = {
  '@': path.resolve(__dirname, 'src'),
  '@components': path.resolve(__dirname, 'src/components'),
  '@utils': path.resolve(__dirname, 'src/utils'),
  '@pages': path.resolve(__dirname, 'src/pages'),
  '@img': path.resolve(__dirname, 'src/assets/images'),
  '@type': path.resolve(__dirname, 'src/types'),
  '@router': path.resolve(__dirname, 'src/router'),
  '@layout': path.resolve(__dirname, 'src/layout'),
  '@setting': path.resolve(__dirname, 'src/setting.ts')
}

export default defineConfig({
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
    port: 3000
  },
  base: '/pseudo-transparent-icon.io/'
})

export const viteConfig = {
  resolve: {
    alias
  }
}

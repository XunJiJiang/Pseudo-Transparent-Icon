import path from 'node:path'
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import devtoolsJson from 'vite-plugin-devtools-json'
import { paraglideVitePlugin } from '@inlang/paraglide-js'

const alias = {
  $: path.resolve(__dirname, 'src'),
  $lib: path.resolve(__dirname, 'src/lib'),
  $utils: path.resolve(__dirname, 'src/utils'),
  $img: path.resolve(__dirname, 'src/assets/images'),
  $type: path.resolve(__dirname, 'src/types'),
  $layout: path.resolve(__dirname, 'src/layout')
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    tailwindcss(),
    devtoolsJson(),
    paraglideVitePlugin({ project: './project.inlang', outdir: './src/lib/paraglide' })
  ],
  resolve: {
    alias
  },
  build: {
    outDir: 'build',
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, 'index.html'),
        ['404']: path.resolve(__dirname, '404.html')
      }
    }
  },
  base:
    process.env.NODE_ENV === 'production'
      ? (process.env.BASE_URL ?? '/pseudo-transparent-icon.io/')
      : '/',
  server: {
    host: true,
    port: 3330
  },
  preview: {
    port: 8080
  }
})

import { dirname, resolve } from 'node:path'
import globals from 'globals'
import pluginJs from '@eslint/js'
import tsEslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'
import prettier from 'eslint-plugin-prettier'
import importPlugin from 'eslint-plugin-import'
import resolverAlias from 'eslint-import-resolver-alias'

const __dirname = dirname(new URL(import.meta.url).pathname)

const joinTo = (...paths) => resolve(__dirname, ...paths)

export default [
  {
    files: ['**/*.{js,mjs,cjs,ts}']
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tsEslint.configs.recommended,
  {
    plugins: {
      'eslint-plugin-prettier': prettier,
      'eslint-plugin-import': importPlugin,
      'eslint-import-resolver-alias': resolverAlias
    },
    settings: {
      'import/resolver': {
        vite: {
          viteConfig: {
            resolve: {
              alias: {
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
            }
          }
        },
        typescript: {
          alwaysTryTypes: true
        },
        node: true,
        alias: true
      }
    }
  },
  eslintConfigPrettier,
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/public/**',
      '**/scripts/**',
      '**/test/**',
      '**/tests/**',
      '**/tmp/**',
      '**/vendor/**',
      '**/webpack/**'
    ]
  }
]

import path from 'node:path'
import globals from 'globals'
import pluginJs from '@eslint/js'
import tsEslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'
import prettier from 'eslint-plugin-prettier'
import importPlugin from 'eslint-plugin-import'
import resolverAlias from 'eslint-import-resolver-alias'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
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
                '@': path.resolve(__dirname, 'src'),
                '@components': path.resolve(__dirname, 'src/components'),
                '@utils': path.resolve(__dirname, 'src/utils'),
                '@views': path.resolve(__dirname, 'src/views'),
                '@img': path.resolve(__dirname, 'src/assets/images'),
                '@type': path.resolve(__dirname, 'src/types'),
                '@layout': path.resolve(__dirname, 'src/layout')
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
  eslintConfigPrettier
]

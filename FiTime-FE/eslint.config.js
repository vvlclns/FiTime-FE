// ...existing code...
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import ts from '@typescript-eslint/eslint-plugin'
import prettierPlugin from 'eslint-plugin-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'node_modules']),

  js.configs.recommended,
  ts.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    ...reactHooks.configs['recommended-latest'],
    languageOptions: {
       parser: '@typescript-eslint/parser',
       ecmaVersion: 2020,
       sourceType: 'module',
       globals: globals.browser,
       parserOptions: {
        ecmaFeatures: { jsx: true },
       },
    },

    plugins: {
      'react-refresh': reactRefresh,
      prettier: prettierPlugin,
    },

    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'quotes': 'off',
      'semi': 'off',
      'prettier/prettier': ['warn', { singleQuote: true, semi: true, endOfLine: 'lf' }],
    },
  },

  prettierPlugin.configs?.recommended ?? {},
])
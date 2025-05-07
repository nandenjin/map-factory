import ts from 'typescript-eslint'
import js from '@eslint/js'
import reactRefresh from 'eslint-plugin-react-refresh'
import reactHooks from 'eslint-plugin-react-hooks'

export default ts.config(
  js.configs.recommended,
  ts.configs.recommended,
  reactRefresh.configs.vite,
  reactHooks.configs['recommended-latest'],
  {
    rules: {
      "react-refresh/only-export-components": "warn"
    }
  }
)
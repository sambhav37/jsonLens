import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['public/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        document: 'readonly',
        window: 'readonly',
        localStorage: 'readonly',
        navigator: 'readonly',
        URL: 'readonly',
        Blob: 'readonly',
        setTimeout: 'readonly',
        console: 'readonly',
        module: 'readonly',
        JsonUtils: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-redeclare': ['error', { builtinGlobals: false }],
      'eqeqeq': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
];

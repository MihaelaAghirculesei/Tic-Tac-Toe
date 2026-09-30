import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser },
    },
  },
  {
    files: ['tests/**/*.js', 'eslint.config.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
];

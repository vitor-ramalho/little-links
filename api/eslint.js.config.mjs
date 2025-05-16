// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      '.eslintignore', // Adding this to silence the warning
    ],
  },
  eslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      sourceType: 'commonjs',
    },
    rules: {
      'no-console': 'off', // Allow console in scripts
      'max-len': ['warn', { 'code': 120 }],
      'no-multiple-empty-lines': ['error', { 'max': 1, 'maxEOF': 1 }],
      'comma-dangle': ['error', 'always-multiline'],
      'quotes': ['error', 'single', { 'avoidEscape': true }],
      'semi': ['error', 'always'],
      'curly': ['error', 'all'],
      'eqeqeq': ['error', 'always'],
      'prefer-const': 'error',
      'no-var': 'error',
      'no-unused-vars': ['error', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_' }],
    },
  },
];

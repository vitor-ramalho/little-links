// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'eslint.config.mjs',
      'eslint.js.config.mjs',
      '.eslintignore', // Adding this to silence the warning
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'src/auth/auth.service.spec.ts',
      'src/auth/auth.service.ts',
      'src/auth/strategies/jwt.strategy.ts',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.json',
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  // Standalone configuration for JavaScript files (like cluster-start.js)
  {
    files: ['scripts/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      sourceType: 'commonjs',
      parserOptions: {
        // Exclude JavaScript files from TypeScript checking
        project: undefined,
      },
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
  {
    files: ['**/*.ts'],
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_' }],
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          'selector': 'interface',
          'format': ['PascalCase'],
          'prefix': ['I']
        },
        {
          'selector': 'typeAlias',
          'format': ['PascalCase']
        },
        {
          'selector': 'enum',
          'format': ['PascalCase']
        }
      ],
      
      // Code style and best practices
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'max-len': ['warn', { 'code': 120 }],
      'no-multiple-empty-lines': ['error', { 'max': 1, 'maxEOF': 1 }],
      'comma-dangle': ['error', 'always-multiline'],
      'quotes': ['error', 'single', { 'avoidEscape': true }],
      'sort-imports': ['error', {
        'ignoreCase': false,
        'ignoreDeclarationSort': true,
        'ignoreMemberSort': false,
        'memberSyntaxSortOrder': ['none', 'all', 'multiple', 'single'],
      }]
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.e2e-spec.ts', '**/test/**/*.ts'],
    rules: {
      'max-len': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  }
);
// eslint.config.js
import js from '@eslint/js';
import pluginImport from 'eslint-plugin-import';
import globals from 'globals';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

import prettier from 'eslint-plugin-prettier';

export default [
  js.configs.recommended,

  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
    },
    plugins: {
      import: pluginImport,
      react: reactPlugin,
      'react-hooks': reactHooks,
      '@typescript-eslint': tseslint,
      'jsx-a11y': jsxA11y,
      prettier,
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        typescript: {},
      },
    },
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off', // This is handled by TypeScript
      'no-redeclare': 'off',
      '@typescript-eslint/no-redeclare': ['error'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-use-before-define': ['error'],
      '@typescript-eslint/no-shadow': ['error'],
      '@typescript-eslint/explicit-function-return-type': 'off',

      'react/jsx-filename-extension': ['warn', { extensions: ['.tsx'] }],
      'react/no-unstable-nested-components': ['warn', { allowAsProps: true }],
      'react/require-default-props': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/prop-types': 'off',

      'no-use-before-define': 'off',
      'react/function-component-definition': 'off',

      'import/extensions': [
        'error',
        'ignorePackages',
        { ts: 'never', tsx: 'never' },
      ],
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],

      'no-shadow': 'off',
      'no-plusplus': 'off',
      ignoreRestSiblings: 0,
      'no-bitwise': 'warn',
      'no-nested-ternary': 'warn',

      'jsx-a11y/label-has-associated-control': 'off',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/mouse-events-have-key-events': 'warn',

      'max-len': ['warn', { code: 140, ignoreUrls: true }],

      'prettier/prettier': 'warn',
    },
  },

  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['eslint.config.js'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
    },
  },

];

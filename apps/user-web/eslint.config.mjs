import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  js.configs.recommended,
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'plugin:import/recommended'),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': 'error', // 미사용 변수는 에러
      'no-console': 'warn', // console 사용 경고(디버깅 편의)
      'react/prop-types': 'off', // TypeScript 사용 시 prop-types 불필요
      'react/jsx-props-no-spreading': 'off', // props spreading 허용(컴포넌트 재사용성)
      '@typescript-eslint/no-explicit-any': 'off', // any 타입 허용(빠른 프로토타이핑)
      'react/react-in-jsx-scope': 'off', // Next.js에서는 React import 불필요
      'prettier/prettier': 'off', // 포맷팅은 Prettier에 맡김
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          pathGroups: [
            {
              pattern: 'next',
              group: 'external',
              position: 'before',
            },
            {
              pattern: 'next/**',
              group: 'external',
              position: 'before',
            },
            {
              pattern: 'react',
              group: 'external',
              position: 'after',
            },
            {
              pattern: 'react/**',
              group: 'external',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          'newlines-between': 'never',
        },
      ],
    },
    // overrides: [
    //   {
    //     files: ['components/ui/**/*.ts', 'components/ui/**/*.tsx'],
    //     rules: {
    //       'import/order': 'off',
    //     },
    //   },
    // ],
  },
  eslintConfigPrettier,
];

export default eslintConfig;

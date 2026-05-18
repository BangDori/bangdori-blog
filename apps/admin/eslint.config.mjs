import { resolve } from 'node:path';
import tseslint from 'typescript-eslint';
import barrel from './eslint/barrel.mjs';
import layers from './eslint/layers.mjs';
import tsOverrides from './eslint/typescript-overrides.mjs';

/**
 * 진입점 — 룰 자체는 eslint/*.mjs 에 분리되어 있다.
 * 새 룰 추가 절차:
 *   1. eslint/<rule-name>.mjs 작성 — flat config 객체 default export
 *   2. 이 파일 상단에 import 한 줄 + 아래 tseslint.config(...) 배열에 한 항목 추가
 */
const rootPath = resolve(import.meta.dirname);
const tsconfigPath = resolve(rootPath, 'tsconfig.json');

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'vite.config.ts', 'eslint.config.mjs', 'eslint/**'] },
  ...tseslint.configs.recommended,
  tsOverrides,
  layers({ rootPath, tsconfigPath }),
  barrel,
);

/**
 * typescript-eslint recommended 중 Biome 와 역할이 겹치는 룰을 끈다.
 *
 *   - Biome 가 noUnusedVariables / noUnusedImports / useImportType 이미 강제
 *   - explicit any 와 empty object type 은 프로젝트 정책상 허용
 *
 * Biome: 포맷/스타일/import 순서
 * ESLint: 아키텍처/import 경계
 * 한 규칙은 한 도구만 책임진다.
 */
export default {
  files: ['src/**/*.{ts,tsx}'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/consistent-type-imports': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-empty-object-type': 'off',
  },
};

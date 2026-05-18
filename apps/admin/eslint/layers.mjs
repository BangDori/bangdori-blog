import boundaries from 'eslint-plugin-boundaries';

/**
 * 레이어 경계 — eslint-plugin-boundaries 의 elements 정의와
 * boundaries/dependencies 규칙만 담당한다.
 *
 *   app        : entry (app.tsx, main.tsx)
 *   pages      : routed page screens
 *   domains    : 도메인 모듈 (api/model/ui), 외부에는 barrel 만 노출
 *   shared     : 도메인 비종속 building block (lib/ui/icons)
 *   components : 앱 전반 공용 컴포넌트 (Layout, QueryProvider 등)
 */
export default function layers({ rootPath, tsconfigPath }) {
  return {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'boundaries/root-path': rootPath,
      'boundaries/include': ['src/**/*.{ts,tsx}'],
      'boundaries/elements': [
        // 가장 구체적인 패턴부터 먼저 매칭되도록 순서 주의
        { type: 'app', mode: 'file', pattern: 'src/(app|main).tsx' },
        { type: 'pages', mode: 'folder', pattern: 'src/pages/*', capture: ['page'] },
        { type: 'domains', mode: 'folder', pattern: 'src/domains/*', capture: ['domain'] },
        { type: 'shared', mode: 'folder', pattern: 'src/shared/*', capture: ['group'] },
        { type: 'components', mode: 'folder', pattern: 'src/components' },
      ],
      'import/resolver': {
        typescript: { project: tsconfigPath },
        node: true,
      },
    },
    rules: {
      // default: disallow — 명시적으로 allow 한 의존만 통과.
      // 같은 element type 간의 의존도 명시적으로 허용해야 한다.
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: { type: 'app' },
              allow: { to: { type: ['app', 'pages', 'domains', 'shared', 'components'] } },
            },
            {
              from: { type: 'pages' },
              allow: { to: { type: ['pages', 'domains', 'shared', 'components'] } },
            },
            {
              from: { type: 'components' },
              allow: { to: { type: ['components', 'shared'] } },
            },
            // domains → shared 허용
            {
              from: { type: 'domains' },
              allow: { to: { type: 'shared' } },
            },
            // domains → 같은 domain 만 허용 (captured.domain 일치 시)
            {
              from: { type: 'domains' },
              allow: {
                to: { type: 'domains', captured: { domain: '{{ from.captured.domain }}' } },
              },
            },
            // shared → shared 만 허용
            {
              from: { type: 'shared' },
              allow: { to: { type: 'shared' } },
            },
          ],
        },
      ],
    },
  };
}

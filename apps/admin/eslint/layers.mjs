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
        // 가장 구체적인 패턴부터 먼저 매칭되도록 순서 주의.
        // pages / components 는 폴더형(pages/posts/) 과 단일 파일형(pages/dashboard.tsx)
        // 두 모양을 모두 page/component element 로 잡아야 cross-element 차단이
        // 동작한다. 정의가 빠지면 단일 파일은 unknown 으로 분류되어 룰이 적용되지 않음.
        { type: 'app', mode: 'file', pattern: 'src/(app|main).tsx' },
        { type: 'pages', mode: 'folder', pattern: 'src/pages/*', capture: ['page'] },
        { type: 'pages', mode: 'file', pattern: 'src/pages/*.{ts,tsx}', capture: ['page'] },
        { type: 'domains', mode: 'folder', pattern: 'src/domains/*', capture: ['domain'] },
        { type: 'shared', mode: 'folder', pattern: 'src/shared/*', capture: ['group'] },
        { type: 'components', mode: 'folder', pattern: 'src/components/*', capture: ['component'] },
        {
          type: 'components',
          mode: 'file',
          pattern: 'src/components/*.{ts,tsx}',
          capture: ['component'],
        },
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
            // R1: pages 끼리 import 금지. 페이지 간 이동은 shared/lib/routes 의
            // string 상수로만. 같은 page 폴더 내부(internal) 는 boundaries 가
            // 기본적으로 차단하지 않으므로 영향 없음.
            {
              from: { type: 'pages' },
              allow: { to: { type: ['domains', 'shared', 'components'] } },
            },
            // components 끼리 import 금지. 앱 shell 컴포넌트는 단일 인스턴스 전제.
            // 같은 폴더형 component 내부 sibling 은 internal 로 통과.
            {
              from: { type: 'components' },
              allow: { to: { type: 'shared' } },
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

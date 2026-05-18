/**
 * 도메인 barrel 강제 — no-restricted-imports 로 @domains/<domain>/<내부파일>
 * 형태의 우회 import 를 차단한다.
 *
 * 도메인 외부에서는 도메인의 barrel(@domains/<domain>/index.ts) 만 통한다.
 * 도메인 내부 코드는 상대경로(../ui/posts-table)로 import 하므로 영향 없음.
 */
export default {
  files: ['src/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@domains/*/*'],
            message:
              '다른 도메인 내부 파일을 직접 import 하지 마세요. 도메인의 barrel(@domains/<domain>) 만 사용합니다.',
          },
        ],
      },
    ],
  },
};

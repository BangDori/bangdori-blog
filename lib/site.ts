export const SITE = {
  name: '강병준 블로그',
  description:
    'Product Engineer 강병준이 기술을 만나며 생긴 질문과 시도, 실패에서 배운 것을 기록하는 블로그입니다.',
  url: 'https://www.bangdori.kr',
  language: 'ko',
  locale: 'ko_KR',
  author: {
    name: '강병준',
    jobTitle: 'Product Engineer',
    sameAs: [
      'https://github.com/bangdori',
      'https://www.linkedin.com/in/bangdori/',
      'https://x.com/bangdorii',
    ],
  },
} as const;

export const SITE_URL = SITE.url;

/** 사이트 상대 경로를 canonical 절대 URL로 변환합니다. */
export function absoluteUrl(path: string = '/'): string {
  return new URL(path, `${SITE_URL}/`).toString();
}

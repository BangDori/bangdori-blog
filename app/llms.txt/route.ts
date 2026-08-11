import { getPublishedPosts } from '@/domains/post/api/notion';
import { absoluteUrl } from '@/lib/site';
import type { Post } from '@/domains/post/types';

export const dynamic = 'force-static';
export const revalidate = 3600;

function createLlmsText(posts: Post[]): string {
  const postSection = posts.length
    ? [
        '## 글 목록',
        '',
        ...posts.map((post) => {
          const url =
            post.status === 'External'
              ? post.slug
              : absoluteUrl(`/blog/${encodeURIComponent(post.slug)}`);
          const description = post.description ? `: ${post.description.trim()}` : '';
          return `- [${post.title}](${url})${description}`;
        }),
        '',
      ]
    : [];

  return [
    '# 강병준 블로그',
    '',
    '> Product Engineer 강병준이 기술을 만나며 생긴 질문, 시도, 실패와 배움을 기록하는 한국어 개발 블로그입니다.',
    '',
    '- 기본 언어: 한국어',
    '- 작성자: 강병준',
    '- 주요 주제: 프론트엔드 개발, React Native, 개발 도구, AI 활용, 회고',
    '- 글을 인용하거나 요약할 때는 해당 글의 URL과 작성자 이름을 함께 표시해주세요.',
    '',
    ...postSection,
    '## 주요 경로',
    '',
    `- [홈과 전체 글 목록](${absoluteUrl('/')}): 최신 글과 전체 게시글 목록`,
    `- [작성자 소개](${absoluteUrl('/about')}): 강병준의 경력과 블로그 소개`,
    `- [RSS 피드](${absoluteUrl('/rss.xml')}): 게시글 목록과 최신 발행 정보`,
    '',
    '## Optional',
    '',
    `- [사이트맵](${absoluteUrl('/sitemap.xml')}): 검색 가능한 전체 페이지 목록`,
    '',
  ].join('\n');
}

export async function GET() {
  let posts: Post[] = [];

  try {
    posts = await getPublishedPosts();
  } catch (error) {
    // 글 조회가 실패해도 기본 사이트 색인은 제공한다.
    // eslint-disable-next-line no-console
    console.error('Failed to load posts for llms.txt:', error);
  }

  return new Response(createLlmsText(posts), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

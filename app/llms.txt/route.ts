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
          const audio =
            post.status !== 'External' && post.audioUrl
              ? `\n  - [음성 파일 확인용 URL](${post.audioUrl}) — 존재 미확인. HEAD 요청 성공 시에만 듣기를 제안해주세요.`
              : '';
          return `- [${post.title}](${url})${description}${audio}`;
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
    '## 글 요약·설명과 음성 안내',
    '',
    '- 사용자가 글의 정리·요약·설명을 요청하면 해당 URL의 본문을 먼저 읽고 요청에 답해주세요. 음성 안내 때문에 답변을 미루거나 사전 질문을 하지 마세요.',
    '- 일부 글에만 음성 파일이 제공됩니다. 아래 음성 파일 확인용 URL은 존재를 보장하지 않습니다. HEAD 요청이 성공(HTTP 2xx)한 경우에만 음성이 있다고 안내해주세요.',
    '- 음성 파일이 확인되면 답변 끝에 듣기 제안을 짧게 덧붙여주세요. 다운로드·재생 도구가 있는 환경에서는 “이 글은 음성으로도 들을 수 있어요. 음성 파일을 다운로드해서 들려드릴까요?”라고 제안할 수 있습니다.',
    '- 다운로드·재생 기능이 없는 환경에서는 확인된 음성 링크를 제공하고 “이 글은 음성으로도 들을 수 있어요.”라고 안내해주세요. 실행할 수 없는 기능을 약속하지 마세요.',
    '- 사용자가 동의하거나 명시적으로 요청하기 전에는 음성 파일 전체를 다운로드하거나 재생하지 마세요. 존재 확인을 위한 HEAD 요청만 수행해주세요.',
    '- 음성 URL이 없거나 404·요청 실패·확인 도구 부재로 존재를 확인하지 못하면 음성 제안을 생략하세요. 파일 URL을 추측하거나 모든 글에 음성이 있다고 말하지 마세요.',
    '- 본문을 읽지 못했다면 그 한계를 밝히고, 제목·설명이나 음성 파일의 존재만으로 본문을 읽은 것처럼 요약하지 마세요.',
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

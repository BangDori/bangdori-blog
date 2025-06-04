import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import type { Post, TagFilterItem } from '@/types/blog';
import type {
  PageObjectResponse,
  PersonUserObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const n2m = new NotionToMarkdown({ notionClient: notion });

/**
 * 포스트 메타데이터를 추출합니다.
 *
 * @param page 페이지 객체
 * @returns 포스트 메타데이터
 */
function getPostMetadata(page: PageObjectResponse): Post {
  const { properties } = page;

  /**
   * 커버 이미지를 추출합니다.
   *
   * @param cover 커버 이미지
   * @returns 커버 이미지 URL
   * @reference https://developers.notion.com/reference/file-object
   */
  const getCoverImage = () => {
    if (!page.cover) return '';

    switch (page.cover.type) {
      case 'external':
        return page.cover.external.url;
      case 'file':
        return page.cover.file.url;
      default:
        return '';
    }
  };

  return {
    id: page.id,
    title: properties.Title.type === 'title' ? (properties.Title.title[0]?.plain_text ?? '') : '',
    description:
      properties.Description.type === 'rich_text'
        ? (properties.Description.rich_text[0]?.plain_text ?? '')
        : '',
    coverImage: getCoverImage(),
    tags:
      properties.Tags.type === 'multi_select'
        ? properties.Tags.multi_select.map((tag) => tag.name)
        : [],
    author:
      properties.Author.type === 'people'
        ? ((properties.Author.people[0] as PersonUserObjectResponse)?.name ?? '')
        : '',
    date: properties.Date.type === 'date' ? (properties.Date.date?.start ?? '') : '',
    modifiedDate: page.last_edited_time,
    slug:
      properties.Slug.type === 'rich_text'
        ? (properties.Slug.rich_text[0]?.plain_text ?? page.id)
        : page.id,
  };
}

export const getPostBySlug = async (
  slug: string
): Promise<{
  markdown: string;
  post: Post;
}> => {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID!,
    filter: {
      and: [
        {
          property: 'Slug',
          rich_text: {
            equals: slug,
          },
        },
        {
          property: 'Status',
          select: {
            equals: 'Published',
          },
        },
      ],
    },
  });

  const mdBlocks = await n2m.pageToMarkdown(response.results[0].id);
  const { parent } = n2m.toMarkdownString(mdBlocks);

  return {
    markdown: parent,
    post: getPostMetadata(response.results[0] as PageObjectResponse),
  };
};

/**
 * 데이터베이스에서 게시된 포스트를 조회합니다.
 *
 * @param tag 태그 필터
 * @returns 게시된 포스트 목록
 * @reference https://developers.notion.com/reference/post-database-query
 */
export const getPublishedPosts = async (tag?: string, sort?: string): Promise<Post[]> => {
  const tags = tag && tag !== '전체' ? [{ property: 'Tags', multi_select: { contains: tag } }] : [];

  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID!,
    filter: {
      and: [
        {
          property: 'Status',
          select: {
            equals: 'Published',
          },
        },
        ...tags,
      ],
    },
    sorts: [
      {
        property: 'Date',
        direction: sort === 'latest' ? 'descending' : 'ascending',
      },
    ],
  });

  return response.results
    .filter((page): page is PageObjectResponse => 'properties' in page) // properties 타입이 존재하는 페이지만 필터링
    .map(getPostMetadata); // 포스트 메타데이터 추출
};

/**
 * 데이터베이스에서 태그를 조회합니다.
 * 1. 모든 포스트를 조회합니다.
 * 2. 모든 태그를 추출하고, 각 포스트의 태그를 추출합니다.
 * 3. "전체" 태그를 추가합니다.
 * 4. "전체" 태그를 0번 인덱스에 위치한 후, 태그 이름 기준으로 정렬합니다.
 *
 * @returns 태그 목록
 */
export const getTags = async (): Promise<TagFilterItem[]> => {
  const posts = await getPublishedPosts();

  // 모든 태그를 추출하고 각 태그의 출현 횟수를 계산
  const tagCount = posts.reduce(
    (acc, post) => {
      post.tags?.forEach((tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
      });

      return acc;
    },
    {} as Record<string, number>
  );

  // TagFilterItem 형식으로 변환
  const tags: TagFilterItem[] = Object.entries(tagCount).map(([name, count]) => ({
    id: name,
    name,
    count,
  }));

  // "전체" 태그 추가
  tags.unshift({
    id: 'all',
    name: '전체',
    count: posts.length,
  });

  // 태그 이름 기준으로 정렬 ("전체" 태그는 항상 첫 번째에 위치하도록 제외)
  const [allTag, ...restTags] = tags;
  const sortedTags = restTags.sort((a, b) => a.name.localeCompare(b.name));

  return [allTag, ...sortedTags];
};

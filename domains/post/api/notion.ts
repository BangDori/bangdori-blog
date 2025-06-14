import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import type { Post } from '../types';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

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

  return {
    id: page.id,
    title: properties.Title.type === 'title' ? (properties.Title.title[0]?.plain_text ?? '') : '',
    description:
      properties.Description.type === 'rich_text'
        ? (properties.Description.rich_text[0]?.plain_text ?? '')
        : '',
    tag: properties.Tag.type === 'select' ? (properties.Tag.select?.name ?? '') : '',
    date: properties.Date.type === 'date' ? (properties.Date.date?.start ?? '') : '',
    slug:
      properties.Slug.type === 'rich_text'
        ? (properties.Slug.rich_text[0]?.plain_text ?? page.id)
        : page.id,
  };
}

export async function getPostBySlug(slug: string): Promise<{
  markdown: string;
  post: Post;
}> {
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
}

export async function getPublishedPosts(): Promise<Post[]> {
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
      ],
    },
    sorts: [
      {
        property: 'Date',
        direction: 'descending',
      },
    ],
  });

  const posts = response.results
    .filter((page): page is PageObjectResponse => 'properties' in page) // properties 타입이 존재하는 페이지만 필터링
    .map(getPostMetadata); // 포스트 메타데이터 추출

  return posts;
}

import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import type { Post } from '../types';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const n2m = new NotionToMarkdown({ notionClient: notion });
const NOTION_S3_IMAGE_URL_PATTERN =
  /https:\/\/prod-files-secure\.s3\.us-west-2\.amazonaws\.com\/[^)]+/g;

/**
 * Notion S3 이미지 URL을 공개 접근 가능한 URL로 변환합니다.
 *
 * @param notionImageUrl Notion S3 이미지 URL
 * @param id pageId | blockId
 * @returns 공개 접근 가능한 이미지 URL
 */
function convertToPublicImageUrl(notionImageUrl: string, id: string) {
  const encodedUrl = encodeURIComponent(notionImageUrl.split('?')[0]);

  return `${process.env.NEXT_PUBLIC_NOTION_SITE_URL}/image/${encodedUrl}?table=block&id=${id}&cache=v2`;
}

/**
 * 포스트 메타데이터를 추출합니다.
 *
 * @param page 페이지 객체
 * @returns 포스트 메타데이터
 */
function getPostMetadata(page: PageObjectResponse): Post {
  const { properties } = page;

  const getCoverImage = (cover: PageObjectResponse['cover']) => {
    if (!cover) return '';

    switch (cover.type) {
      case 'external':
        return cover.external.url;
      case 'file':
        return cover.file.url;
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
    coverImage: convertToPublicImageUrl(getCoverImage(page.cover), page.id),
    createdAt: properties.CreatedAt.type === 'date' ? (properties.CreatedAt.date?.start ?? '') : '',
    updatedAt: properties.UpdatedAt.type === 'date' ? (properties.UpdatedAt.date?.start ?? '') : '',
    tag: properties.Tag.type === 'select' ? (properties.Tag.select?.name ?? '') : '',
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
  const transformedBlocks = mdBlocks.map((mdBlock) => {
    return mdBlock.type !== 'image'
      ? mdBlock
      : {
          ...mdBlock,
          parent: mdBlock.parent.replace(
            NOTION_S3_IMAGE_URL_PATTERN,
            (url) => `${convertToPublicImageUrl(url, mdBlock.blockId)}`
          ),
        };
  });
  const { parent } = n2m.toMarkdownString(transformedBlocks);

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
        property: 'CreatedAt',
        direction: 'descending',
      },
    ],
  });

  const posts = response.results
    .filter((page): page is PageObjectResponse => 'properties' in page) // properties 타입이 존재하는 페이지만 필터링
    .map(getPostMetadata); // 포스트 메타데이터 추출

  return posts;
}

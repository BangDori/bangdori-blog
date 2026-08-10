import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import type { Post } from '../types';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

class CjkCompatibleNotionToMarkdown extends NotionToMarkdown {
  override annotatePlainText(
    text: string,
    annotations: Parameters<NotionToMarkdown['annotatePlainText']>[1]
  ) {
    const markdown = super.annotatePlainText(text, annotations);

    if (!annotations.italic || /^\s*$/.test(text)) return markdown;

    // `_기울임_을`은 CommonMark에서 한 단어로 인식되어 그대로 노출된다.
    // notion-to-md가 추가한 구분자만 명시적 요소로 바꿔 굵기·한글 조사와 함께 파싱되게 한다.
    const leadingSpace = text.match(/^\s*/)?.[0] ?? '';
    const trailingSpace = text.match(/\s*$/)?.[0] ?? '';
    const outerPrefix = `${leadingSpace}${annotations.underline ? '<u>' : ''}${annotations.strikethrough ? '~~' : ''}`;
    const outerSuffix = `${annotations.strikethrough ? '~~' : ''}${annotations.underline ? '</u>' : ''}${trailingSpace}`;
    const openingDelimiterIndex = outerPrefix.length;
    const closingDelimiterIndex = markdown.length - outerSuffix.length - 1;

    if (markdown[openingDelimiterIndex] !== '_' || markdown[closingDelimiterIndex] !== '_') {
      return markdown;
    }

    return `${markdown.slice(0, openingDelimiterIndex)}<em>${markdown.slice(
      openingDelimiterIndex + 1,
      closingDelimiterIndex
    )}</em>${markdown.slice(closingDelimiterIndex + 1)}`;
  }
}

const n2m = new CjkCompatibleNotionToMarkdown({ notionClient: notion });

// Bookmark 블록을 커스텀 컴포넌트로 변환
n2m.setCustomTransformer('bookmark', async (block) => {
  const { bookmark } = block as { bookmark: { url: string; caption?: { plain_text: string }[] } };
  const url = bookmark.url;
  return `<Bookmark url="${url}" />`;
});
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

  const coverImage = getCoverImage(page.cover);

  return {
    id: page.id,
    title: properties.Title.type === 'title' ? (properties.Title.title[0]?.plain_text ?? '') : '',
    description:
      properties.Description.type === 'rich_text'
        ? (properties.Description.rich_text[0]?.plain_text ?? '')
        : '',
    coverImage: coverImage ? convertToPublicImageUrl(coverImage, page.id) : '',
    createdAt: properties.CreatedAt.type === 'date' ? (properties.CreatedAt.date?.start ?? '') : '',
    updatedAt: properties.UpdatedAt.type === 'date' ? (properties.UpdatedAt.date?.start ?? '') : '',
    tag: properties.Tag.type === 'select' ? (properties.Tag.select?.name ?? '') : '',
    slug:
      properties.Slug.type === 'rich_text'
        ? (properties.Slug.rich_text[0]?.plain_text ?? page.id)
        : page.id,
    status: properties.Status.type === 'select' ? (properties.Status.select?.name ?? '') : '',
  };
}

export async function getPostBySlug(slug: string): Promise<
  | {
      markdown: string;
      post: Post;
    }
  | undefined
> {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID as string,
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

  const page = response.results.find(
    (result): result is PageObjectResponse => 'properties' in result
  );
  if (!page) return undefined;

  const mdBlocks = await n2m.pageToMarkdown(page.id);
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
    post: getPostMetadata(page),
  };
}

export async function getPublishedPosts(): Promise<Post[]> {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID as string,
    filter: {
      or: [
        {
          property: 'Status',
          select: {
            equals: 'Published',
          },
        },
        {
          property: 'Status',
          select: {
            equals: 'External',
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

export async function getBookPosts(): Promise<Post[]> {
  const posts = await getPublishedPosts();

  return posts.filter((post) => post.status === 'Published' && post.tag === 'book');
}

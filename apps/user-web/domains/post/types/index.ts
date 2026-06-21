export interface PostListItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string;
  thumbnailUrl: string | null;
  publishedAt: string | null;
  updatedAt: string;
}

export interface ExternalPostListItem {
  id: string;
  title: string;
  url: string;
  source: string;
  category: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BaseFeedItem {
  id: string;
  title: string;
  category: string;
  publishedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  href: string;
  openInNewTab: boolean;
  source: string | null;
}

export interface InternalPostFeedItem extends BaseFeedItem {
  type: 'post';
  slug: string;
  href: `/blog/${string}`;
  openInNewTab: false;
  source: null;
}

interface ExternalPostFeedItem extends BaseFeedItem {
  type: 'external';
  url: string;
  openInNewTab: true;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export type FeedItem = InternalPostFeedItem | ExternalPostFeedItem;

export interface PostDetail extends PostListItem {
  contentMdx: string;
  author: string;
  createdAt: string;
}

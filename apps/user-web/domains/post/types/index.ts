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
  category: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FeedItemBase {
  id: string;
  type: 'post' | 'external';
  title: string;
  category: string | null;
  publishedAt: string | null;
  updatedAt: string;
  href: string;
  openInNewTab: boolean;
}

export interface PostFeedItem extends FeedItemBase {
  type: 'post';
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  href: `/blog/${string}`;
  openInNewTab: false;
  source: null;
}

export interface ExternalFeedItem extends FeedItemBase {
  type: 'external';
  url: string;
  openInNewTab: true;
  source: string;
}

export type FeedItem = PostFeedItem | ExternalFeedItem;

export interface PostDetail extends PostListItem {
  contentMdx: string;
  author: string;
  createdAt: string;
}

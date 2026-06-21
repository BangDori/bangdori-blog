import type {
  ExternalPostListItem,
  FeedItem,
  InternalPostFeedItem,
  PostDetail,
  PostListItem,
} from '../types';

const BASE = process.env.NEXT_PUBLIC_API_URL;

if (!BASE) {
  throw new Error(
    'NEXT_PUBLIC_API_URL is not set. Set it in apps/user-web/.env(.development) or build args.',
  );
}

function getFeedSortTime(item: FeedItem) {
  const value = item.publishedAt ?? item.updatedAt ?? item.createdAt;

  if (!value) return Number.NEGATIVE_INFINITY;

  const time = Date.parse(value);

  return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
}

function compareFeedItems(a: FeedItem, b: FeedItem) {
  const aTime = getFeedSortTime(a);
  const bTime = getFeedSortTime(b);

  if (aTime !== bTime) return bTime - aTime;
  if (a.type === b.type) return 0;

  return a.type === 'post' ? -1 : 1;
}

function toInternalFeedItem(post: PostListItem): InternalPostFeedItem {
  return {
    type: 'post',
    id: post.id,
    slug: post.slug,
    title: post.title,
    category: post.category,
    publishedAt: post.publishedAt,
    createdAt: null,
    updatedAt: post.updatedAt,
    href: `/blog/${post.slug}`,
    openInNewTab: false,
    source: null,
  };
}

function toExternalFeedItem(post: ExternalPostListItem): FeedItem {
  return {
    type: 'external',
    id: post.id,
    title: post.title,
    url: post.url,
    category: post.category,
    publishedAt: post.publishedAt,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    href: post.url,
    openInNewTab: true,
    source: post.source,
  };
}

export async function getPublishedPosts(): Promise<PostListItem[]> {
  const res = await fetch(`${BASE}/user/posts`, { next: { revalidate: 60 } });

  if (!res.ok) {
    throw new Error(`Failed to fetch published posts: ${res.status}`);
  }

  return res.json();
}

async function getExternalPosts(): Promise<ExternalPostListItem[]> {
  const res = await fetch(`${BASE}/user/external-posts`, { next: { revalidate: 60 } });

  if (!res.ok) {
    throw new Error(`Failed to fetch external posts: ${res.status}`);
  }

  return res.json();
}

export async function getFeedItems(): Promise<FeedItem[]> {
  const [posts, externalPosts] = await Promise.all([getPublishedPosts(), getExternalPosts()]);

  return [...posts.map(toInternalFeedItem), ...externalPosts.map(toExternalFeedItem)].sort(
    compareFeedItems,
  );
}

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  const res = await fetch(`${BASE}/user/posts/${encodeURIComponent(slug)}`, {
    next: { revalidate: 300 },
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch post "${slug}": ${res.status}`);
  }

  return res.json();
}

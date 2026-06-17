import type { ExternalPostListItem, FeedItem, PostDetail, PostListItem } from '../types';

function getApiBase() {
  const base = process.env.NEXT_PUBLIC_API_URL;

  if (!base) {
    throw new Error(
      'NEXT_PUBLIC_API_URL is not set. Set it in apps/user-web/.env(.development) or build args.',
    );
  }

  return base;
}

export async function getPublishedPosts(): Promise<PostListItem[]> {
  const base = getApiBase();
  const res = await fetch(`${base}/user/posts`, { next: { revalidate: 60 } });

  if (!res.ok) {
    throw new Error(`Failed to fetch published posts: ${res.status}`);
  }

  return res.json();
}

export async function getExternalPosts(): Promise<ExternalPostListItem[]> {
  const base = getApiBase();
  const res = await fetch(`${base}/user/external-posts`, { next: { revalidate: 60 } });

  if (!res.ok) {
    throw new Error(`Failed to fetch external posts: ${res.status}`);
  }

  return res.json();
}

export function normalizePostToFeedItem(post: PostListItem): FeedItem {
  return {
    ...post,
    type: 'post',
    category: post.category,
    href: `/blog/${post.slug}`,
    openInNewTab: false,
    source: null,
  };
}

export function normalizeExternalPostToFeedItem(post: ExternalPostListItem): FeedItem {
  return {
    id: post.id,
    type: 'external',
    title: post.title,
    url: post.url,
    category: post.category,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    href: post.url,
    openInNewTab: true,
    source: post.source,
  };
}

function getFeedItemSortTime(item: FeedItem) {
  const date = item.publishedAt ?? item.updatedAt;
  const time = new Date(date).getTime();

  return Number.isNaN(time) ? null : time;
}

export function mergeFeedItems(
  posts: PostListItem[],
  externalPosts: ExternalPostListItem[],
): FeedItem[] {
  return [
    ...posts.map(normalizePostToFeedItem),
    ...externalPosts.map(normalizeExternalPostToFeedItem),
  ]
    .map((item, index) => ({ item, index, sortTime: getFeedItemSortTime(item) }))
    .sort((a, b) => {
      if (a.sortTime === null && b.sortTime === null) {
        if (a.item.type !== b.item.type) {
          return a.item.type === 'post' ? -1 : 1;
        }

        return a.index - b.index;
      }

      if (a.sortTime === null) return 1;
      if (b.sortTime === null) return -1;

      if (a.sortTime !== b.sortTime) {
        return b.sortTime - a.sortTime;
      }

      if (a.item.type !== b.item.type) {
        return a.item.type === 'post' ? -1 : 1;
      }

      return a.index - b.index;
    })
    .map(({ item }) => item);
}

export async function getFeedItems(): Promise<FeedItem[]> {
  const [posts, externalPosts] = await Promise.all([
    getPublishedPosts(),
    getExternalPosts().catch((): ExternalPostListItem[] => []),
  ]);

  return mergeFeedItems(posts, externalPosts);
}

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  const base = getApiBase();
  const res = await fetch(`${base}/user/posts/${encodeURIComponent(slug)}`, {
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

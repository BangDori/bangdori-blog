import type { PostDetail, PostListItem } from '../types';

const BASE = process.env.NEXT_PUBLIC_API_URL;

export async function getPublishedPosts(): Promise<PostListItem[]> {
  const res = await fetch(`${BASE}/user/posts`, { next: { revalidate: 60 } });

  if (!res.ok) {
    throw new Error(`Failed to fetch published posts: ${res.status}`);
  }

  return res.json();
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

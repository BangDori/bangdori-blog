import type { Post } from '../types';

export function getPostShareImage(post: Post) {
  if (post.coverImage) {
    return { url: post.coverImage, alt: `${post.title} 대표 이미지` };
  }

  const version = encodeURIComponent(post.lastEditedAt || post.updatedAt || post.createdAt);
  return {
    url: `/blog/${encodeURIComponent(post.slug)}/opengraph-image?v=${version}`,
    width: 1200,
    height: 630,
    alt: post.title,
  };
}

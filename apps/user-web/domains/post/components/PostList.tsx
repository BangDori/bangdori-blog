'use client';

import Link from 'next/link';
import { trackClick } from '@/lib/gtag';
import type { PostListItem } from '../types';
import { PostCard } from './PostCard';

interface PostListProps {
  posts: PostListItem[];
}

export function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return <p className="text-muted-foreground text-sm">아직 발행된 글이 없어요.</p>;
  }

  return (
    <div className="grid gap-2">
      {posts.map((post) => (
        <Link
          href={`/blog/${post.slug}`}
          key={post.id}
          className="rounded-sm px-0.5 py-1 transition-colors duration-200 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => trackClick('post_card', { slug: post.slug, text: post.title })}
        >
          <PostCard post={post} />
        </Link>
      ))}
    </div>
  );
}

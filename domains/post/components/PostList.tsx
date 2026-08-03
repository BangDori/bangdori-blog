'use client';

import Link from 'next/link';
import { trackClick } from '@/lib/gtag';
import { PostCard } from './PostCard';
import type { Post } from '../types';

interface PostListProps {
  posts: Post[];
}

export function PostList({ posts }: PostListProps) {
  return (
    <div className="grid gap-2">
      {posts.map((post) => {
        const isExternal = post.status === 'External';
        const href = isExternal ? post.slug : `/blog/${post.slug}`;

        return (
          <Link
            href={href}
            key={post.id}
            className="rounded-sm px-0.5 py-1 transition-colors duration-200 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-800"
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            onClick={() =>
              isExternal
                ? trackClick('external_post_card', { title: post.title, url: href })
                : trackClick('post_card', { slug: post.slug, text: post.title })
            }
          >
            <PostCard post={post} />
          </Link>
        );
      })}
    </div>
  );
}

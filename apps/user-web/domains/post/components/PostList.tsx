'use client';

import Link from 'next/link';
import { trackClick } from '@/lib/gtag';
import type { FeedItem } from '../types';
import { PostCard } from './PostCard';

interface PostListProps {
  items: FeedItem[];
}

export function PostList({ items }: PostListProps) {
  if (items.length === 0) {
    return <p className="text-muted-foreground text-sm">아직 발행된 글이 없어요.</p>;
  }

  return (
    <div className="grid gap-2">
      {items.map((item) =>
        item.type === 'post' ? (
          <Link
            href={item.href}
            key={`${item.type}:${item.id}`}
            className="rounded-sm px-0.5 py-1 transition-colors duration-200 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => trackClick('post_card', { slug: item.slug, text: item.title })}
          >
            <PostCard item={item} />
          </Link>
        ) : (
          <a
            href={item.href}
            key={`${item.type}:${item.id}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${item.title} (${item.source}) 외부 글 새 탭에서 열기`}
            className="rounded-sm px-0.5 py-1 transition-colors duration-200 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() =>
              trackClick('external_post_card', {
                source: item.source,
                text: item.title,
                url: item.url,
              })
            }
          >
            <PostCard item={item} />
          </a>
        ),
      )}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { trackClick } from '@/lib/gtag';
import type { FeedItem } from '../types';
import { PostCard } from './PostCard';

interface PostListProps {
  items: FeedItem[];
}

const POST_LINK_CLASS =
  'rounded-sm px-0.5 py-1 transition-colors duration-200 ease-in-out hover:bg-secondary focus-visible:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]';

export function PostList({ items }: PostListProps) {
  if (items.length === 0) {
    return <p className="text-muted-foreground text-sm">아직 보여줄 글이 없어요.</p>;
  }

  return (
    <div className="grid gap-2">
      {items.map((item) =>
        item.type === 'post' ? (
          <Link
            href={item.href}
            key={`${item.type}:${item.id}`}
            className={POST_LINK_CLASS}
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
            className={POST_LINK_CLASS}
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

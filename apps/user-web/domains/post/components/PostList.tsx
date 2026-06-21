'use client';

import Link from 'next/link';
import { trackClick } from '@/lib/gtag';
import type { FeedItem } from '../types';
import { PostCard } from './PostCard';

interface PostListProps {
  items: FeedItem[];
}

const cardLinkClassName =
  'block w-full rounded-sm px-0.5 py-1 transition-colors duration-200 ease-in-out hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

function trackFeedItemClick(item: FeedItem) {
  if (item.type === 'post') {
    trackClick('post_card', { slug: item.slug, text: item.title });
    return;
  }

  trackClick('external_post_card', { source: item.source, title: item.title, url: item.url });
}

export function PostList({ items }: PostListProps) {
  if (items.length === 0) {
    return <p className="text-muted-foreground text-sm">아직 표시할 글이 없어요.</p>;
  }

  return (
    <ul className="grid list-none gap-2">
      {items.map((item) => {
        if (item.openInNewTab) {
          return (
            <li key={`${item.type}:${item.id}`}>
              <a
                href={item.href}
                className={cardLinkClassName}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${item.title}, 외부 링크, 새 탭에서 열림`}
                onClick={() => trackFeedItemClick(item)}
              >
                <PostCard item={item} />
              </a>
            </li>
          );
        }

        return (
          <li key={`${item.type}:${item.id}`}>
            <Link
              href={item.href}
              className={cardLinkClassName}
              onClick={() => trackFeedItemClick(item)}
            >
              <PostCard item={item} />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

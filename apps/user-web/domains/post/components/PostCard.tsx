'use client';

import { CommentCount } from '@/components/CommentCount';
import { formatDate } from '@/lib/date';
import type { FeedItem } from '../types';

interface PostCardProps {
  item: FeedItem;
}

function formatFeedDate(item: FeedItem) {
  const date = item.publishedAt ?? item.updatedAt;
  const time = new Date(date).getTime();

  return Number.isNaN(time) ? '' : formatDate(date);
}

export function PostCard({ item }: PostCardProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-baseline gap-2">
        <h2 className="min-w-0 truncate text-base font-medium">{item.title}</h2>
        {item.category && (
          <span className="shrink-0 whitespace-nowrap text-muted-foreground text-[10px]">
            {item.category}
          </span>
        )}
        {item.type === 'post' ? (
          <CommentCount slug={item.slug} />
        ) : (
          <span className="shrink-0 whitespace-nowrap rounded-sm bg-secondary px-1 py-0.5 text-[10px] text-muted-foreground">
            External · {item.source}
          </span>
        )}
      </div>
      <p className="shrink-0 whitespace-nowrap text-muted-foreground text-xs">
        {formatFeedDate(item)}
      </p>
    </div>
  );
}

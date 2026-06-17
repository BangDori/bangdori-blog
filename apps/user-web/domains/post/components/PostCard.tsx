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
    <div className="flex min-w-0 items-center justify-between gap-4 overflow-hidden">
      <div className="flex min-w-0 flex-1 items-baseline gap-2 overflow-hidden">
        <h2 className="line-clamp-1 min-w-0 flex-1 break-all text-base font-medium">
          {item.title}
        </h2>
        {item.category && (
          <span
            title={item.category}
            className="min-w-0 max-w-12 truncate text-muted-foreground text-[10px] sm:max-w-32"
          >
            {item.category}
          </span>
        )}
        {item.type === 'post' ? (
          <CommentCount slug={item.slug} />
        ) : (
          <span
            title={`External · ${item.source}`}
            className="inline-flex min-w-0 max-w-24 rounded-sm bg-secondary px-1 py-0.5 text-[10px] text-muted-foreground sm:max-w-40"
          >
            <span className="shrink-0">External ·&nbsp;</span>
            <span className="min-w-0 truncate">{item.source}</span>
          </span>
        )}
      </div>
      <p className="shrink-0 whitespace-nowrap text-muted-foreground text-xs">
        {formatFeedDate(item)}
      </p>
    </div>
  );
}

'use client';

import { CommentCount } from '@/components/CommentCount';
import { formatDate } from '@/lib/date';
import type { FeedItem } from '../types';

interface PostCardProps {
  item: FeedItem;
}

function getDisplayDate(item: FeedItem) {
  const value = item.publishedAt ?? item.updatedAt ?? item.createdAt;

  if (!value || Number.isNaN(Date.parse(value))) return undefined;

  return value;
}

export function PostCard({ item }: PostCardProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
        <h2 className="min-w-0 max-w-full truncate text-base font-medium">{item.title}</h2>
        <span className="bg-muted text-muted-foreground shrink-0 rounded-sm px-1 py-0.5 text-[10px]">
          {item.type === 'post' ? 'internal' : 'external'}
        </span>
        <span className="text-muted-foreground inline-block max-w-24 shrink-0 truncate text-[10px]">
          {item.category}
        </span>
        {item.type === 'external' && (
          <span className="bg-accent inline-block max-w-28 shrink-0 truncate rounded-sm px-1 py-0.5 text-[10px] text-primary">
            {item.source}
          </span>
        )}
        {item.type === 'post' && <CommentCount slug={item.slug} />}
      </div>
      <p className="text-muted-foreground shrink-0 text-xs">{formatDate(getDisplayDate(item))}</p>
    </div>
  );
}

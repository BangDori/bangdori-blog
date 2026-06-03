'use client';

import { CommentCount } from '@/components/CommentCount';
import { formatDate } from '@/lib/date';
import type { PostListItem } from '../types';

interface PostCardProps {
  post: PostListItem;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-baseline gap-2">
        <h2 className="max-w-[calc(100vw-200px)] truncate text-base font-medium">{post.title}</h2>
        <span className="text-muted-foreground text-[10px]">{post.category}</span>
        <CommentCount slug={post.slug} />
      </div>
      <p className="text-muted-foreground text-xs">{formatDate(post.publishedAt ?? '')}</p>
    </div>
  );
}

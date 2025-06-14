'use client';

import { formatDate } from '@/lib/date';
import type { Post } from '../types';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-baseline gap-2">
        <h2 className="text-base font-medium">{post.title}</h2>
        <span className="text-muted-foreground text-[10px]">{post.tag}</span>
      </div>
      <p className="text-muted-foreground text-xs">{formatDate(post.date)}</p>
    </div>
  );
}

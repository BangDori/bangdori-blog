'use client';

import { useEffect, useState } from 'react';

interface CommentCountProps {
  slug: string;
}

let cachedCommentCounts: Record<string, number> | null = null;
let fetchPromise: Promise<Record<string, number>> | null = null;

async function fetchCommentCounts(): Promise<Record<string, number>> {
  if (cachedCommentCounts) {
    return cachedCommentCounts;
  }

  if (fetchPromise) {
    return fetchPromise;
  }

  fetchPromise = fetch('/api/comments')
    .then((res) => res.json())
    .then((data) => {
      cachedCommentCounts = data;
      fetchPromise = null;
      return data;
    })
    .catch(() => {
      fetchPromise = null;
      return {};
    });

  return fetchPromise;
}

export function CommentCount({ slug }: CommentCountProps) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetchCommentCounts().then((counts) => {
      const path = `blog/${slug}`;
      const commentCount = counts[path] || 0;
      setCount(commentCount);
    });
  }, [slug]);

  if (count === null || count === 0) {
    return null;
  }

  return <span className="text-muted-foreground text-xs">+{count}</span>;
}

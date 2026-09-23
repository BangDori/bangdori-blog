'use client';

import { useEffect, useState } from 'react';

interface ViewCounterProps {
  slug: string;
}

export function ViewCounter({ slug }: ViewCounterProps) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    const incrementView = async () => {
      try {
        const response = await fetch(`/api/views/${slug}`, { method: 'POST' });
        if (!response.ok) throw new Error('Failed to increment views');
        const data = await response.json();
        setViews(data.views);
      } catch {
        // 증가 실패 시 조회수만 가져오기
        try {
          const response = await fetch(`/api/views/${slug}`);
          if (!response.ok) return;
          const data = await response.json();
          setViews(data.views);
        } catch {
          // 실패해도 무시
        }
      }
    };

    incrementView();
  }, [slug]);

  if (views === null) {
    return null;
  }

  return (
    <span className="text-muted-foreground text-[10px] sm:text-xs md:text-sm">
      조회수 <b className="font-normal text-black dark:text-white">{views.toLocaleString()}</b>회
    </span>
  );
}

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
        const response = await fetch(`/api/views/${slug}`, {
          method: 'POST',
        });
        const data = await response.json();
        setViews(data.views);
      } catch {
        try {
          const response = await fetch(`/api/views/${slug}`);
          const data = await response.json();
          setViews(data.views);
        } catch {}
      }
    };

    incrementView();
  }, [slug]);

  if (views === null) {
    return null;
  }

  return (
    <span className="text-muted-foreground text-[10px] sm:text-xs md:text-sm">
      Views <b className="font-normal text-black dark:text-white">{views.toLocaleString()}</b>
    </span>
  );
}

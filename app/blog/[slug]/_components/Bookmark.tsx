'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface OgData {
  title: string;
  description: string;
  image: string;
  favicon: string;
}

interface BookmarkProps {
  url: string;
}

export function Bookmark({ url }: BookmarkProps) {
  const [ogData, setOgData] = useState<OgData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchOgData = async () => {
      try {
        const res = await fetch(`/api/og?url=${encodeURIComponent(url)}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setOgData(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOgData();
  }, [url]);

  const hostname = new URL(url).hostname;

  if (loading) {
    return (
      <div className="not-prose my-4">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex overflow-hidden rounded-lg border border-neutral-200 no-underline dark:border-neutral-700"
        >
          <div className="flex flex-1 flex-col justify-center gap-2 p-4">
            <div className="h-5 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
          </div>
          <div className="hidden h-[120px] w-[200px] animate-pulse bg-neutral-200 sm:block dark:bg-neutral-700" />
        </a>
      </div>
    );
  }

  if (error || !ogData) {
    return null;
  }

  return (
    <div className="not-prose my-4">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex overflow-hidden rounded-lg border border-neutral-200 no-underline transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
      >
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 p-4">
          <span className="line-clamp-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {ogData.title || hostname}
          </span>
          {ogData.description && (
            <span className="line-clamp-2 text-xs font-normal text-neutral-500 dark:text-neutral-400">
              {ogData.description}
            </span>
          )}
          <div className="flex gap-2 pt-2">
            {ogData.favicon && (
              <Image
                src={ogData.favicon}
                alt=""
                width={16}
                height={16}
                className="mx-0! size-4 rounded-sm"
                unoptimized
              />
            )}
            <span className="text-xs font-normal text-neutral-400 dark:text-neutral-500">
              {hostname}
            </span>
          </div>
        </div>
        {ogData.image && (
          <div className="relative hidden h-[120px] w-[200px] shrink-0 sm:block">
            <Image
              src={ogData.image}
              alt={ogData.title || ''}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}
      </a>
    </div>
  );
}

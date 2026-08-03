'use client';

import Image from 'next/image';
import Link from 'next/link';
import { trackClick } from '@/lib/gtag';
import type { Post } from '../types';

interface BookGridProps {
  books: Post[];
}

const BOOK_PLACEMENTS = [
  'w-[82%] -rotate-[0.6deg] sm:w-[72%]',
  'w-[85%] rotate-[0.4deg] sm:w-[75%]',
  'w-[81%] -rotate-[0.2deg] sm:w-[71%]',
] as const;

export function BookGrid({ books }: BookGridProps) {
  const rows = Array.from({ length: Math.ceil(books.length / 3) }, (_, index) =>
    books.slice(index * 3, index * 3 + 3)
  );

  return (
    <div className="space-y-10 sm:space-y-14">
      {rows.map((row, rowIndex) => (
        <div
          key={row.map((book) => book.id).join('-')}
          className="relative grid grid-cols-3 items-end gap-2 px-2 pb-[15px] sm:gap-8 sm:px-7"
        >
          {row.map((book, columnIndex) => (
            <Link
              href={`/blog/${book.slug}`}
              key={book.id}
              aria-label={`${book.title} 독후감 보기`}
              title={book.title}
              className={`${BOOK_PLACEMENTS[(rowIndex + columnIndex) % BOOK_PLACEMENTS.length]} focus-visible:ring-primary relative z-10 mx-auto block origin-bottom rounded-sm focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none`}
              onClick={() => trackClick('book_card', { slug: book.slug, text: book.title })}
            >
              <span
                className="absolute right-[2%] -bottom-1 left-[8%] h-[9px] rounded-full bg-slate-700/25 blur-[5px] dark:bg-black/60"
                aria-hidden="true"
              />
              <span className="bg-muted relative z-10 block aspect-3/4 overflow-hidden rounded-[2px_4px_2px_1px] border border-black/10 shadow-[7px_13px_20px_-10px_rgba(45,62,80,0.62),-2px_1px_5px_-3px_rgba(15,23,42,0.5)] dark:border-white/8 dark:shadow-[8px_14px_22px_-10px_rgba(0,0,0,0.95),-2px_1px_6px_-3px_rgba(0,0,0,0.9)]">
                {book.coverImage ? (
                  <Image
                    src={book.coverImage}
                    alt={`${book.title} 표지`}
                    fill
                    sizes="(max-width: 639px) 30vw, 180px"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center p-3 text-center">
                    <span className="text-muted-foreground text-xs font-medium break-keep">
                      {book.title}
                    </span>
                  </span>
                )}
              </span>
            </Link>
          ))}

          <span
            className="absolute right-0 bottom-0.5 left-0 h-2.5 rounded-[2px] bg-white shadow-[0_5px_7px_rgba(115,140,164,0.16),0_16px_26px_rgba(150,174,197,0.34),inset_0_1px_0_rgba(255,255,255,0.9)] sm:-right-3.5 sm:-left-3.5 dark:bg-[#363e49] dark:shadow-[0_6px_9px_rgba(0,0,0,0.32),0_17px_28px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.12)]"
            aria-hidden="true"
          />
        </div>
      ))}
    </div>
  );
}

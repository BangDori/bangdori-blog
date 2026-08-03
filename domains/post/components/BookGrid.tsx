'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';
import { trackClick } from '@/lib/gtag';
import type { Post } from '../types';
import { calculateLightGeometry } from '../utils/lightGeometry';
import styles from './BookGrid.module.css';

interface BookGridProps {
  books: Post[];
}

const BOOK_PLACEMENTS = [
  'w-[82%] -rotate-[0.6deg] sm:w-[72%]',
  'w-[85%] rotate-[0.4deg] sm:w-[75%]',
  'w-[81%] -rotate-[0.2deg] sm:w-[71%]',
] as const;

export function BookGrid({ books }: BookGridProps) {
  const { resolvedTheme } = useTheme();
  const [isThemeReady, setIsThemeReady] = useState(false);
  const [isLightOn, setIsLightOn] = useState(false);
  const bookshelfRef = useRef<HTMLDivElement>(null);
  const lightSourceRef = useRef<HTMLSpanElement>(null);
  const firstShelfRef = useRef<HTMLSpanElement>(null);
  const rows = Array.from({ length: Math.ceil(books.length / 3) }, (_, index) =>
    books.slice(index * 3, index * 3 + 3)
  );

  useEffect(() => {
    if (!resolvedTheme) return;

    setIsThemeReady(true);
    setIsLightOn(resolvedTheme === 'dark');
  }, [resolvedTheme]);

  useEffect(() => {
    const bookshelf = bookshelfRef.current;
    const lightSource = lightSourceRef.current;
    const firstShelf = firstShelfRef.current;

    if (!bookshelf || !lightSource || !firstShelf) return;

    let animationFrame = 0;

    const updateLightGeometry = () => {
      const geometry = calculateLightGeometry(
        lightSource.getBoundingClientRect(),
        firstShelf.getBoundingClientRect(),
        bookshelf.getBoundingClientRect()
      );
      const [alpha0, alpha25, alpha50, alpha75, alpha100] = geometry.falloff;

      bookshelf.style.setProperty('--light-target-left', `${geometry.targetLeft}px`);
      bookshelf.style.setProperty('--light-target-width', `${geometry.targetWidth}px`);
      bookshelf.style.setProperty('--light-source-x', `${geometry.sourceX}px`);
      bookshelf.style.setProperty('--light-range', `${geometry.range}px`);
      bookshelf.style.setProperty('--light-edge-intensity', `${geometry.edgeIntensity}`);
      bookshelf.style.setProperty(
        '--light-edge-alpha',
        `${Number((alpha100 * geometry.edgeIntensity).toFixed(3))}`
      );
      bookshelf.style.setProperty('--light-alpha-0', `${alpha0}`);
      bookshelf.style.setProperty('--light-alpha-25', `${alpha25}`);
      bookshelf.style.setProperty('--light-alpha-50', `${alpha50}`);
      bookshelf.style.setProperty('--light-alpha-75', `${alpha75}`);
      bookshelf.style.setProperty('--light-alpha-100', `${alpha100}`);
      bookshelf.dataset.lightSpreadAngle = `${geometry.spreadAngle}deg`;
      bookshelf.dataset.lightRange = `${Math.round(geometry.range)}px`;
      bookshelf.dataset.lightSlantRange = `${Math.round(geometry.slantRange)}px`;
    };

    const scheduleUpdate = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(updateLightGeometry);
    };

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(bookshelf);
    resizeObserver.observe(lightSource);
    resizeObserver.observe(firstShelf);
    scheduleUpdate();

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, []);

  const canToggleLight = isThemeReady && resolvedTheme === 'dark';
  const isLightActive = canToggleLight && isLightOn;

  return (
    <div
      ref={bookshelfRef}
      className={`${styles.bookshelf} ${isLightActive ? '' : styles.lightOff}`}
    >
      <div className={styles.lightScene}>
        <button
          type="button"
          className={styles.lightToggle}
          aria-label={
            canToggleLight
              ? isLightActive
                ? '책장 조명 끄기'
                : '책장 조명 켜기'
              : '책장 조명은 다크 모드에서 사용할 수 있습니다'
          }
          aria-pressed={isLightActive}
          title={canToggleLight ? (isLightActive ? '조명 끄기' : '조명 켜기') : undefined}
          disabled={!canToggleLight}
          onClick={() => setIsLightOn((current) => !current)}
        />
        <span className={styles.pictureArmLeft} aria-hidden="true" />
        <span className={styles.pictureArmRight} aria-hidden="true" />
        <span className={styles.pictureBar} aria-hidden="true" />
        <span ref={lightSourceRef} className={styles.pictureLens} aria-hidden="true" />
        <span className={styles.lightGlow} aria-hidden="true" />
        <span className={styles.lightBeam} aria-hidden="true" />
      </div>

      <div className="relative z-10 space-y-10 pt-20 sm:space-y-14">
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
              ref={rowIndex === 0 ? firstShelfRef : undefined}
              className="absolute right-0 bottom-0.5 left-0 h-2.5 rounded-[2px] bg-white shadow-[0_5px_7px_rgba(115,140,164,0.16),0_16px_26px_rgba(150,174,197,0.34),inset_0_1px_0_rgba(255,255,255,0.9)] sm:-right-3.5 sm:-left-3.5 dark:bg-[#363e49] dark:shadow-[0_6px_9px_rgba(0,0,0,0.32),0_17px_28px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.12)]"
              aria-hidden="true"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

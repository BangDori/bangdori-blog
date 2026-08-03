'use client';

import { type ReactNode, useEffect, useRef } from 'react';
import { trackImpression, trackScroll } from '@/lib/gtag';
import type { ImpressionOptions, ScrollOptions } from '@/lib/ga-events.type';

type ImpressionEvent =
  | [ImpressionOptions['target']]
  | [ImpressionOptions['target'], Omit<ImpressionOptions, 'target'>];

interface OnVisibleProps {
  children: ReactNode;
  event: ImpressionEvent;
  threshold?: number;
  className?: string;
}

export function OnVisible({ children, event, threshold = 0.3, className }: OnVisibleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const hasFired = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || hasFired.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasFired.current) {
          hasFired.current = true;
          const [target, options] = event;
          trackImpression(target, options);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [event, threshold]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

type ScrollEvent = [ScrollOptions['target'], { thresholds: number[]; slug?: string }];

interface OnScrollProps {
  children: ReactNode;
  event: ScrollEvent;
  className?: string;
}

export function OnScroll({ children, event, className }: OnScrollProps) {
  const fired = useRef(new Set<number>());
  const [target, { thresholds, slug }] = event;

  useEffect(() => {
    fired.current = new Set<number>();

    const handler = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;

      const progress = (window.scrollY / scrollable) * 100;

      for (const threshold of thresholds) {
        if (progress >= threshold && !fired.current.has(threshold)) {
          fired.current.add(threshold);
          trackScroll(target, threshold, slug ? { slug } : undefined);
        }
      }
    };

    window.addEventListener('scroll', handler, { passive: true });
    handler();

    return () => window.removeEventListener('scroll', handler);
  }, [target, thresholds, slug]);

  return className ? <div className={className}>{children}</div> : children;
}

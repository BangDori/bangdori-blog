'use client';

import { type ReactNode, useEffect, useRef } from 'react';
import type { ImpressionOptions, ScrollOptions } from '@/lib/ga-events.type';
import { trackImpression, trackScroll } from '@/lib/gtag';

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
    const el = ref.current;
    if (!el || hasFired.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasFired.current) {
          hasFired.current = true;
          const [target, options] = event;
          trackImpression(target, options);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(el);
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

      for (const t of thresholds) {
        if (progress >= t && !fired.current.has(t)) {
          fired.current.add(t);
          trackScroll(target, t, slug ? { slug } : undefined);
        }
      }
    };

    window.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => window.removeEventListener('scroll', handler);
  }, [target, thresholds, slug]);

  return className ? <div className={className}>{children}</div> : children;
}

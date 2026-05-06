'use client';

import { type ReactNode, useEffect, useRef } from 'react';
import type { ImpressionOptions } from '@/lib/ga-events.type';
import { trackImpression } from '@/lib/gtag';

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

import type { ClickOptions, ImpressionOptions, ScrollOptions } from './ga-events.type';

declare global {
  interface Window {
    gtag?: (...args: [string, ...unknown[]]) => void;
  }
}

export function trackEvent(action: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, params);
  }
}

export function trackClick(target: ClickOptions['target'], options?: Omit<ClickOptions, 'target'>) {
  trackEvent('click', { target, ...options });
}

export function trackImpression(
  target: ImpressionOptions['target'],
  options?: Omit<ImpressionOptions, 'target'>,
) {
  trackEvent('impression', { target, ...options });
}

export function trackScroll(
  target: ScrollOptions['target'],
  percent: number,
  options?: { slug?: string },
) {
  trackEvent('scroll', { target, percent, ...options });
}

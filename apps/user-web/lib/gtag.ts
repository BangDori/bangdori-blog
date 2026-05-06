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

function sanitizeUrl(raw?: string) {
  if (!raw) return undefined;
  try {
    const u = new URL(raw);
    return `${u.origin}${u.pathname}`;
  } catch {
    return undefined;
  }
}

export function trackClick(target: ClickOptions['target'], options?: Omit<ClickOptions, 'target'>) {
  trackEvent('click', { target, ...options, url: sanitizeUrl(options?.url) });
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

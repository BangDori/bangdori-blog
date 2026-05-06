import type { ImpressionOptions } from './ga-events.type';

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

export function trackImpression(
  target: ImpressionOptions['target'],
  options?: Omit<ImpressionOptions, 'target'>,
) {
  trackEvent('impression', { target, ...options });
}

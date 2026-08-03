import type { ClickOptions, ImpressionOptions, ScrollOptions } from './ga-events.type';

declare global {
  interface Window {
    // 함수 타입에는 인자 이름이 필요하지만 선언부에서는 직접 사용하지 않는다.
    // eslint-disable-next-line no-unused-vars
    gtag?: (...args: [string, ...unknown[]]) => void;
  }
}

function trackEvent(action: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, params);
  }
}

function sanitizeUrl(raw?: string) {
  if (!raw) return undefined;

  try {
    const url = new URL(raw);

    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return `${url.origin}${url.pathname}`;
    }

    if (url.protocol === 'mailto:') {
      return `${url.protocol}${url.pathname}`;
    }

    return undefined;
  } catch {
    return undefined;
  }
}

export function trackClick(target: ClickOptions['target'], options?: Omit<ClickOptions, 'target'>) {
  trackEvent('click', { target, ...options, url: sanitizeUrl(options?.url) });
}

export function trackImpression(
  target: ImpressionOptions['target'],
  options?: Omit<ImpressionOptions, 'target'>
) {
  trackEvent('impression', { target, ...options });
}

export function trackScroll(
  target: ScrollOptions['target'],
  percent: number,
  options?: { slug?: string }
) {
  trackEvent('scroll', { target, percent, ...options });
}

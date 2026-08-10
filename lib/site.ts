export const SITE_URL = 'https://www.bangdori.kr';

export function absoluteUrl(path = '/') {
  return new URL(path, `${SITE_URL}/`).toString();
}

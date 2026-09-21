export async function audioExists(src: string, signal: AbortSignal) {
  try {
    const response = await fetch(src, { method: 'HEAD', cache: 'no-store', signal });
    return response.ok;
  } catch {
    return false;
  }
}

// 서버 렌더링용: 파일 전체를 받지 않고, 확인 결과를 한 시간마다 갱신한다.
export async function getAvailablePostAudioUrl(src?: string) {
  if (!src) return undefined;

  try {
    const response = await fetch(src, {
      method: 'HEAD',
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(3000),
    });
    return response.ok ? src : undefined;
  } catch {
    return undefined;
  }
}

export function getPostAudioUrl(slug: string, baseUrl?: string) {
  if (!baseUrl?.trim()) return undefined;

  try {
    const url = new URL(baseUrl.trim());
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
      return undefined;
    }
    url.pathname = `${url.pathname.replace(/\/+$/, '')}/${encodeURIComponent(slug)}.mp3`;
    return url.href;
  } catch {
    return undefined;
  }
}

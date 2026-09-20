export async function audioExists(src: string, signal: AbortSignal) {
  try {
    const response = await fetch(src, { method: 'HEAD', cache: 'no-store', signal });
    return response.ok;
  } catch {
    return false;
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

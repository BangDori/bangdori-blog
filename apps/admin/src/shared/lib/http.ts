const BASE_URL = (import.meta.env.VITE_SERVER_API_URL ?? '').replace(/\/$/, '');

class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  query?: Record<string, string | undefined>;
  body?: unknown;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(`${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    }
  }

  return url.toString();
}

function extractMessage(body: unknown, fallback: string): string {
  if (typeof body === 'object' && body !== null) {
    const m = (body as { message?: unknown }).message;
    if (typeof m === 'string') return m;
    if (Array.isArray(m) && m.length > 0 && typeof m[0] === 'string') return m.join(', ');
  }

  return fallback;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', query, body, signal } = options;

  const headers: Record<string, string> = { Accept: 'application/json' };
  let payload: BodyInit | undefined;
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: payload,
      signal,
    });
  } catch (err) {
    throw new ApiError(0, err instanceof Error ? err.message : '네트워크 오류', null);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  const parsed: unknown = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      extractMessage(parsed, `요청 실패 (${response.status})`),
      parsed,
    );
  }

  return parsed as T;
}

export const api = {
  get: <T>(path: string, query?: RequestOptions['query']) =>
    request<T>(path, { method: 'GET', query }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export function formatError(err: Error): string {
  if (err instanceof ApiError) return `[${err.status}] ${err.message}`;
  return err.message;
}

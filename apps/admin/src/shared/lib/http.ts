import { ROUTES } from './routes';

const BASE_URL = (import.meta.env.VITE_SERVER_API_URL ?? '').replace(/\/$/, '');

export class ApiError extends Error {
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
  skipAuthRedirect?: boolean;
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
  const { method = 'GET', query, body, signal, skipAuthRedirect = false } = options;

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
      credentials: 'include',
    });
  } catch (err) {
    throw new ApiError(0, err instanceof Error ? err.message : '네트워크 오류', null);
  }

  if (response.status === 401 && !skipAuthRedirect) {
    window.location.assign(ROUTES.login);
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
  get: <T>(
    path: string,
    query?: RequestOptions['query'],
    options?: Omit<RequestOptions, 'method' | 'query' | 'body'>,
  ) => request<T>(path, { method: 'GET', query, ...options }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { method: 'POST', body, ...options }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { method: 'PATCH', body, ...options }),
  delete: <T>(path: string, options?: Omit<RequestOptions, 'method'>) =>
    request<T>(path, { method: 'DELETE', ...options }),
};

export function formatError(err: Error): string {
  if (err instanceof ApiError) return `[${err.status}] ${err.message}`;
  return err.message;
}

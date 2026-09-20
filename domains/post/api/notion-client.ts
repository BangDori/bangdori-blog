import { APIResponseError, Client, UnknownHTTPResponseError } from '@notionhq/client';

export class RetryingNotionClient extends Client {
  override async request<ResponseBody>(
    args: Parameters<Client['request']>[0]
  ): Promise<ResponseBody> {
    for (let attempt = 0; ; attempt++) {
      try {
        return await super.request<ResponseBody>(args);
      } catch (error) {
        if (
          !(error instanceof APIResponseError || error instanceof UnknownHTTPResponseError) ||
          error.status !== 429 ||
          attempt >= 3
        ) {
          throw error;
        }

        const retryAfter =
          error.headers instanceof Headers ? error.headers.get('retry-after')?.trim() : undefined;
        const seconds = retryAfter && /^\d+$/.test(retryAfter) ? Number(retryAfter) : NaN;
        const delay = Number.isFinite(seconds) ? seconds * 1000 : 1000 * 2 ** attempt;
        // Wait outside the SDK's per-request timeout; jitter avoids synchronized retries.
        await new Promise((resolve) => setTimeout(resolve, delay + Math.random() * 250));
      }
    }
  }
}

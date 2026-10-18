/**
 * Error thrown by callApi for a failed request. `message` keeps the historical format
 * ("API request failed: <status> ..."), so code that shows `err.message` keeps working; new code
 * should show `messageKey` (translated) through useNotify().error(err).
 */
export class ApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly body: string;
  readonly url: string;

  constructor(status: number, statusText: string, body: string, url: string) {
    super(`API request failed: ${status} ${statusText} ${body}. Url: ${url}`);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.body = body;
    this.url = url;
  }

  /** i18n key describing the failure for the user. Status 0 means the request never got a response. */
  get messageKey(): string {
    if (this.status === 0) return 'error-network';
    if (this.status === 400 || this.status === 422) return 'error-bad-request';
    if (this.status === 401) return 'error-unauthorized';
    if (this.status === 403) return 'error-forbidden';
    if (this.status === 404) return 'error-not-found';
    if (this.status === 409) return 'error-conflict';
    if (this.status >= 500) return 'error-server';
    return 'unexpected-error';
  }

  /** The `message` field of a JSON error body (NestJS and FastAPI style), when there is one. */
  get detail(): string | undefined {
    try {
      const parsed = JSON.parse(this.body);
      const message = parsed?.message ?? parsed?.detail;
      if (Array.isArray(message)) return message.join(', ');
      return typeof message === 'string' ? message : undefined;
    } catch {
      return undefined;
    }
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

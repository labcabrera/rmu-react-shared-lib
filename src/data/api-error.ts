/**
 * Error thrown by callApi for a failed request. `message` keeps the historical format
 * ("API request failed: <status> ..."), so code that shows `err.message` keeps working; new code
 * should show `messageKey` (translated) through useNotify().error(err).
 */
/** Error codes of specs 071, 072 and 073 with a message of their own. */
const STRATEGIC_ACCESS_CODES = [
  'not-a-friend',
  'member-limit',
  'join-request-limit',
  'not-a-player',
  'realm-not-readable',
  'realm-not-writable',
  'global-entity-admin-only',
  'faction-player-not-a-player',
  'faction-player-limit',
  'not-a-faction-player',
  'game-not-public',
  'already-member',
];

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
    if (this.code === 'version-conflict') return 'error-version-conflict';
    if (this.code === 'system-entity-admin-only') return 'error-system-entity-admin-only';
    // Spec 069: sharing an entity.
    if (this.code === 'share-not-friend' || this.code === 'share-self' || this.code === 'share-limit-reached') {
      return `error-${this.code}`;
    }
    // Spec 071: members of a strategic game.
    if (this.code && STRATEGIC_ACCESS_CODES.includes(this.code)) return `error-${this.code}`;
    if (this.status === 0) return 'error-network';
    if (this.status === 400 || this.status === 422) return 'error-bad-request';
    if (this.status === 401) return 'error-unauthorized';
    if (this.status === 403) return 'error-forbidden';
    if (this.status === 404) return 'error-not-found';
    if (this.status === 409) return 'error-conflict';
    if (this.status >= 500) return 'error-server';
    return 'unexpected-error';
  }

  /** The stable `code` of a JSON error body (`not-found`, `version-conflict`...), when the API sends one. */
  get code(): string | undefined {
    try {
      const code = JSON.parse(this.body)?.code;
      return typeof code === 'string' ? code : undefined;
    } catch {
      return undefined;
    }
  }

  /** The `details` of a JSON error body (the issues of an invalid import file...), when there are any. */
  get details(): unknown {
    try {
      return JSON.parse(this.body)?.details;
    } catch {
      return undefined;
    }
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

/** Domain codes sent without the `err-` prefix; their i18n key is `err-<code>`. */
const UNPREFIXED_CODES = ['herb-without-effect', 'herb-not-applicable'];

/**
 * Domain error code of an API error body (`{ code, message }`), when it is a translatable one. Falls back to the
 * deprecated `errorCode` alias that images released before workspace spec 021 still send.
 */
export const apiErrorCode = (error: unknown): string | undefined => {
  if (!isApiError(error)) return undefined;
  try {
    const body = JSON.parse(error.body);
    const code = body?.code ?? body?.errorCode;
    if (typeof code !== 'string') return undefined;
    if (code.startsWith('err-')) return code;
    // Herb rules of workspace spec 062 send their codes without the prefix
    return UNPREFIXED_CODES.includes(code) ? `err-${code}` : undefined;
  } catch {
    return undefined;
  }
};

/** `details` of an API error body (`{ code, message, details }`), when it is an object. */
export const apiErrorDetails = (error: unknown): Record<string, unknown> | undefined => {
  if (!isApiError(error)) return undefined;
  try {
    const details = JSON.parse(error.body)?.details;
    return details && typeof details === 'object' ? (details as Record<string, unknown>) : undefined;
  } catch {
    return undefined;
  }
};

/** Rejection of a request whose confirmation the user declined (workspace spec 068): nothing to report. */
export class ConfirmCancelledError extends Error {
  constructor() {
    super('confirm-cancelled');
    this.name = 'ConfirmCancelledError';
  }
}

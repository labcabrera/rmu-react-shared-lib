import { describe, expect, it } from 'vitest';
import { ApiError, isApiError } from './api-error';

describe('ApiError', () => {
  it('keeps the historical message format', () => {
    const error = new ApiError(500, 'Internal Server Error', '{"statusCode":500}', '/api/items/v1/items');
    expect(error.message).toBe(
      'API request failed: 500 Internal Server Error {"statusCode":500}. Url: /api/items/v1/items'
    );
    expect(isApiError(error)).toBe(true);
    expect(isApiError(new Error('x'))).toBe(false);
  });

  it.each([
    [0, 'error-network'],
    [400, 'error-bad-request'],
    [401, 'error-unauthorized'],
    [403, 'error-forbidden'],
    [404, 'error-not-found'],
    [409, 'error-conflict'],
    [503, 'error-server'],
    [418, 'unexpected-error'],
  ])('maps status %i to %s', (status, key) => {
    expect(new ApiError(status, '', '', '/x').messageKey).toBe(key);
  });

  it('reads the code of the body and explains a concurrent change', () => {
    const stale = new ApiError(409, '', '{"statusCode":409,"code":"version-conflict","message":"x"}', '/x');
    expect(stale.code).toBe('version-conflict');
    expect(stale.messageKey).toBe('error-version-conflict');
    const duplicated = new ApiError(409, '', '{"code":"duplicate-key"}', '/x');
    expect(duplicated.messageKey).toBe('error-conflict');
    expect(new ApiError(500, '', 'not json', '/x').code).toBeUndefined();
  });

  it('extracts the detail from NestJS and validation bodies', () => {
    expect(new ApiError(404, '', '{"message":"Item not found"}', '/x').detail).toBe('Item not found');
    expect(new ApiError(400, '', '{"message":["name is required","size must be positive"]}', '/x').detail).toBe(
      'name is required, size must be positive'
    );
    expect(new ApiError(500, '', 'not json', '/x').detail).toBeUndefined();
  });
});

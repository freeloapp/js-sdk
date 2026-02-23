/**
 * Error response shape returned by the Freelo API.
 */
export interface FreeloErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
  code?: number;
}

/**
 * Check if an unknown error value looks like a Freelo API error response.
 */
export function isFreeloError(error: unknown): error is FreeloErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('message' in error || 'errors' in error || 'code' in error)
  );
}

/**
 * Check if the error is a rate limit (HTTP 429) response.
 */
export function isRateLimited(error: unknown): boolean {
  return isFreeloError(error) && error.code === 429;
}

/**
 * Check if the error is an unauthorized (HTTP 401) response.
 */
export function isUnauthorized(error: unknown): boolean {
  return isFreeloError(error) && error.code === 401;
}

/**
 * Check if the error is a not found (HTTP 404) response.
 */
export function isNotFound(error: unknown): boolean {
  return isFreeloError(error) && error.code === 404;
}

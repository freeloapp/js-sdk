/**
 * Freelo SDK - Official JavaScript/TypeScript SDK for Freelo.io API
 *
 * @example
 * ```typescript
 * import { createFreelo, getProjects, createTask } from '@freeloapp/js-sdk';
 *
 * // Initialize client (sets global default)
 * createFreelo({
 *   auth: { type: 'basic', email: 'your@email.tld', apiKey: 'your-api-key' },
 *   userAgent: 'YourApp/1.0 (contact@yourapp.com)',
 * });
 *
 * // Get all projects
 * const { data: projects } = await getProjects();
 *
 * // Create a task
 * const { data: task } = await createTask({
 *   path: { tasklist_id: 123 },
 *   body: { name: 'New Task', worker_ids: [userId] },
 * });
 * ```
 *
 * @packageDocumentation
 */

// Main configuration function + low-level call
export {
  createFreelo,
  call,
  type FreeloConfig,
  type FreeloAuth,
  type BasicAuth,
  type BearerAuth,
  type CallOptions,
  type CallResult,
} from './freelo.js';

// Generated client (for advanced usage / custom client instances)
export { createClient } from './generated/client/index.js';

// Generated SDK functions — tree-shakeable
export * from './generated/sdk.gen.js';

// Generated types
export type * from './generated/types.gen.js';

// Error handling utilities
export { isFreeloError, isRateLimited, isUnauthorized, isNotFound } from './errors.js';
export type { FreeloErrorResponse } from './errors.js';

// OAuth utilities — tree-shakeable
export {
  generateCodeVerifier,
  generateCodeChallenge,
  generatePKCEChallenge,
  buildAuthorizationUrl,
  exchangeCode,
  refreshAccessToken,
  revokeToken,
  discoverOAuthServer,
  OAuthTokenError,
  DEFAULT_OAUTH_ISSUER,
} from './oauth.js';

export type {
  OAuthAuth,
  OAuthTokens,
  PKCEChallenge,
  AuthorizationUrlParams,
  TokenExchangeParams,
  TokenResponse,
  RefreshTokenParams,
  RevokeTokenParams,
  OAuthServerMetadata,
} from './oauth.js';

// Utility functions — tree-shakeable
export {
  currencyToApi,
  currencyFromApi,
  formatCurrency,
  formatCurrencyFromApi,
  dateToApi,
  toApiWithTime,
  toApiWithLocalTime,
  dateFromApi,
  isValidDate,
  today,
  daysFromNow,
  weeksFromNow,
  monthsFromNow,
  dateRange,
  hasMorePages,
  getTotalPages,
  iteratePages,
  iteratePageResponses,
  fetchAllPages,
  createPaginator,
} from './utils/index.js';

export type {
  EnhancedPaginatedResponse,
  PaginationOptions,
  PageFetcher,
  DataExtractor,
} from './utils/index.js';

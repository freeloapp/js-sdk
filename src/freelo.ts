import { createClient } from './generated/client';
import type { Client } from './generated/client';
import { client as defaultClient } from './generated/client.gen';
import type { HttpMethod } from './generated/core/types.gen';
import type { OAuthAuth } from './oauth.js';
import { maybeRefreshToken, tryRefreshToken } from './oauth.js';

/** Basic Auth using email + API key. */
export interface BasicAuth {
  type: 'basic';
  email: string;
  apiKey: string;
}

/** Bearer token auth (JWT, PASETO, etc.). */
export interface BearerAuth {
  type: 'bearer';
  token: string;
}

/** Supported authentication methods. */
export type FreeloAuth = BasicAuth | BearerAuth | OAuthAuth;

export interface FreeloConfig {
  /** Authentication credentials. */
  auth: FreeloAuth;
  /** Required User-Agent header. */
  userAgent: string;
  /** Optional base URL (default: https://api.freelo.io/v1) */
  baseUrl?: string;
  /** Enable request/response logging to console. */
  logging?: boolean;
}

/**
 * Resolve auth config into an Authorization header value.
 */
function resolveAuthHeader(auth: FreeloAuth): string {
  switch (auth.type) {
    case 'basic':
      return `Basic ${btoa(`${auth.email}:${auth.apiKey}`)}`;
    case 'bearer':
      return `Bearer ${auth.token}`;
    case 'oauth':
      return `Bearer ${auth.accessToken}`;
  }
}

/**
 * Apply shared interceptors (auth, user-agent, logging, rate-limit) to a client.
 */
function applyInterceptors(target: Client, config: FreeloConfig): void {
  // Auth + User-Agent (with proactive OAuth refresh)
  if (config.auth.type === 'oauth') {
    const oauthAuth = config.auth;
    target.interceptors.request.use(async (request) => {
      await maybeRefreshToken(oauthAuth);
      request.headers.set('Authorization', resolveAuthHeader(config.auth));
      request.headers.set('User-Agent', config.userAgent);
      return request;
    });
  } else {
    target.interceptors.request.use((request) => {
      request.headers.set('Authorization', resolveAuthHeader(config.auth));
      request.headers.set('User-Agent', config.userAgent);
      return request;
    });
  }

  // Logging
  if (config.logging) {
    target.interceptors.request.use((request) => {
      console.log(`[Freelo] ${request.method} ${request.url}`);
      return request;
    });
    target.interceptors.response.use((response, request) => {
      console.log(`[Freelo] ${response.status} ${request.url}`);
      return response;
    });
  }

  // Rate limit warning
  target.interceptors.response.use((response) => {
    if (response.status === 429) {
      console.warn(
        '[Freelo] Rate limited (429). Freelo allows 25 requests per minute. Wait 60 seconds before retrying.',
      );
    }
    return response;
  });

  // OAuth reactive refresh: retry once on 401
  if (config.auth.type === 'oauth') {
    const oauthAuth = config.auth;
    target.interceptors.response.use(async (response, request, options) => {
      if (response.status !== 401) return response;

      const refreshed = await tryRefreshToken(oauthAuth);
      if (!refreshed) return response;

      // Retry the original request with the new token
      const headers = new Headers(request.headers);
      headers.set('Authorization', `Bearer ${oauthAuth.accessToken}`);
      const retryRequest = new Request(request.url, {
        method: request.method,
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        redirect: 'follow',
      });
      const _fetch = options.fetch ?? globalThis.fetch;
      return _fetch(retryRequest);
    });
  }
}

/**
 * Create and configure a Freelo API client.
 *
 * Sets up authentication, User-Agent header, optional logging,
 * and rate limit handling via interceptors. The created client
 * is also set as the global default so SDK functions can be
 * called without explicitly passing `{ client }`.
 *
 * @example
 * ```ts
 * import { createFreelo, getProjects } from '@freeloapp/js-sdk';
 *
 * const client = createFreelo({
 *   auth: { type: 'basic', email: 'you@example.com', apiKey: 'your-api-key' },
 *   userAgent: 'MyApp/1.0 (contact@myapp.com)',
 * });
 *
 * // Uses default client
 * const { data } = await getProjects();
 *
 * // Or pass client explicitly (multi-tenant)
 * const { data: other } = await getProjects({ client });
 * ```
 */
export function createFreelo(config: FreeloConfig): Client {
  const baseUrl = config.baseUrl ?? 'https://api.freelo.io/v1';

  const client = createClient({ baseUrl });
  applyInterceptors(client, config);

  // Set as global default so SDK functions work without { client }
  defaultClient.setConfig({ baseUrl });
  applyInterceptors(defaultClient, config);

  return client;
}

/**
 * Options for the low-level `call()` function.
 */
export interface CallOptions {
  /** HTTP method (GET, POST, PUT, PATCH, DELETE, etc.) */
  method: Uppercase<HttpMethod>;
  /**
   * URL path relative to baseUrl (e.g. `/projects` or `/task/123`).
   * Can also be a full URL — it will be passed through as-is.
   */
  url: string;
  /** Query parameters appended to the URL */
  query?: Record<string, unknown>;
  /** Request body (will be JSON-serialized) */
  body?: unknown;
  /** Additional headers merged with the defaults (Auth, User-Agent) */
  headers?: Record<string, string>;
  /** Path parameters interpolated into the URL (e.g. `{task_id}`) */
  path?: Record<string, unknown>;
  /** Optional client instance; defaults to the global client set by `createFreelo()` */
  client?: Client;
}

/**
 * Low-level function for calling arbitrary Freelo API endpoints.
 *
 * Authentication, User-Agent, logging, and rate-limit handling are applied
 * automatically via the interceptors configured by `createFreelo()`.
 *
 * Use this when you need to call an endpoint that is not (yet) covered
 * by the auto-generated SDK functions.
 *
 * @example
 * ```ts
 * import { createFreelo, call } from '@freeloapp/js-sdk';
 *
 * createFreelo({ auth: { type: 'basic', email, apiKey }, userAgent: 'MyApp/1.0' });
 *
 * // GET /projects
 * const { data, error } = await call({ method: 'GET', url: '/projects' });
 *
 * // POST with body
 * const { data: task } = await call({
 *   method: 'POST',
 *   url: '/tasklist/{tasklist_id}/tasks',
 *   path: { tasklist_id: 123 },
 *   body: { name: 'New task' },
 * });
 *
 * // With query params and extra headers
 * const { data: results } = await call({
 *   method: 'GET',
 *   url: '/search',
 *   query: { q: 'keyword', page: 1 },
 *   headers: { 'X-Custom': 'value' },
 * });
 * ```
 */
export async function call<TData = unknown, TError = unknown>(
  options: CallOptions,
): Promise<
  | { data: TData; error: undefined; request: Request; response: Response }
  | { data: undefined; error: TError; request: Request; response: Response }
> {
  const c = options.client ?? defaultClient;

  return c.request({
    method: options.method,
    url: options.url,
    body: options.body,
    query: options.query,
    path: options.path,
    headers: options.headers,
  }) as any;
}

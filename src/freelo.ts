import { createClient } from './generated/client';
import type { Client } from './generated/client';
import { client as defaultClient } from './generated/client.gen';

export interface FreeloConfig {
  /** E-mail for Basic Auth */
  email: string;
  /** API key for Basic Auth */
  apiKey: string;
  /** Required User-Agent header */
  userAgent: string;
  /** Optional base URL (default: https://api.freelo.io/v1) */
  baseUrl?: string;
  /** Enable request/response logging to console */
  logging?: boolean;
}

/**
 * Create and configure a Freelo API client.
 *
 * Sets up Basic Auth, User-Agent header, optional logging,
 * and rate limit handling via interceptors. The created client
 * is also set as the global default so SDK functions can be
 * called without explicitly passing `{ client }`.
 *
 * @example
 * ```ts
 * import { createFreelo, getProjects } from '@freeloapp/js-sdk';
 *
 * const client = createFreelo({
 *   email: 'you@example.com',
 *   apiKey: 'your-api-key',
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
  const client = createClient({
    baseUrl: config.baseUrl ?? 'https://api.freelo.io/v1',
  });

  // Basic Auth + User-Agent interceptor
  client.interceptors.request.use((request) => {
    const credentials = btoa(`${config.email}:${config.apiKey}`);
    request.headers.set('Authorization', `Basic ${credentials}`);
    request.headers.set('User-Agent', config.userAgent);
    return request;
  });

  // Logging interceptor
  if (config.logging) {
    client.interceptors.request.use((request) => {
      console.log(`[Freelo] ${request.method} ${request.url}`);
      return request;
    });
    client.interceptors.response.use((response, request) => {
      console.log(`[Freelo] ${response.status} ${request.url}`);
      return response;
    });
  }

  // Rate limit interceptor — log warning on 429
  client.interceptors.response.use((response) => {
    if (response.status === 429) {
      console.warn(
        '[Freelo] Rate limited (429). Freelo allows 25 requests per minute. Wait 60 seconds before retrying.',
      );
    }
    return response;
  });

  // Set as global default so SDK functions work without { client }
  defaultClient.setConfig({
    baseUrl: config.baseUrl ?? 'https://api.freelo.io/v1',
  });

  // Copy interceptors to default client
  defaultClient.interceptors.request.use((request) => {
    const credentials = btoa(`${config.email}:${config.apiKey}`);
    request.headers.set('Authorization', `Basic ${credentials}`);
    request.headers.set('User-Agent', config.userAgent);
    return request;
  });

  if (config.logging) {
    defaultClient.interceptors.request.use((request) => {
      console.log(`[Freelo] ${request.method} ${request.url}`);
      return request;
    });
    defaultClient.interceptors.response.use((response, request) => {
      console.log(`[Freelo] ${response.status} ${request.url}`);
      return response;
    });
  }

  defaultClient.interceptors.response.use((response) => {
    if (response.status === 429) {
      console.warn(
        '[Freelo] Rate limited (429). Freelo allows 25 requests per minute. Wait 60 seconds before retrying.',
      );
    }
    return response;
  });

  return client;
}

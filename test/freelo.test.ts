import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createFreelo } from '../src/freelo';
import { DEFAULT_OAUTH_ISSUER } from '../src/oauth';

describe('createFreelo', () => {
  const mockFetch = vi.fn();
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = mockFetch;
    mockFetch.mockReset();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('creates a client with correct baseUrl', () => {
    const client = createFreelo({
      auth: { type: 'basic', email: 'test@example.com', apiKey: 'test-key' },
      userAgent: 'Test/1.0',
    });

    const config = client.getConfig();
    expect(config.baseUrl).toBe('https://api.freelo.io/v1');
  });

  it('uses custom baseUrl when provided', () => {
    const client = createFreelo({
      auth: { type: 'basic', email: 'test@example.com', apiKey: 'test-key' },
      userAgent: 'Test/1.0',
      baseUrl: 'https://custom.api.com/v1',
    });

    const config = client.getConfig();
    expect(config.baseUrl).toBe('https://custom.api.com/v1');
  });

  it('sets Basic Auth header on requests', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = createFreelo({
      auth: { type: 'basic', email: 'test@example.com', apiKey: 'test-key' },
      userAgent: 'Test/1.0',
    });

    await client.get({
      url: '/projects',
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const request = mockFetch.mock.calls[0][0] as Request;
    const expectedCredentials = btoa('test@example.com:test-key');
    expect(request.headers.get('Authorization')).toBe(
      `Basic ${expectedCredentials}`,
    );
  });

  it('sets Bearer Auth header on requests', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = createFreelo({
      auth: { type: 'bearer', token: 'my-jwt-token' },
      userAgent: 'ms-teams',
    });

    await client.get({
      url: '/projects',
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const request = mockFetch.mock.calls[0][0] as Request;
    expect(request.headers.get('Authorization')).toBe('Bearer my-jwt-token');
    expect(request.headers.get('User-Agent')).toBe('ms-teams');
  });

  it('sets User-Agent header on requests', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = createFreelo({
      auth: { type: 'basic', email: 'test@example.com', apiKey: 'test-key' },
      userAgent: 'TestApp/2.0 (contact@test.com)',
    });

    await client.get({
      url: '/projects',
    });

    const request = mockFetch.mock.calls[0][0] as Request;
    expect(request.headers.get('User-Agent')).toBe(
      'TestApp/2.0 (contact@test.com)',
    );
  });

  it('applies configured default headers to every request', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    const client = createFreelo({
      auth: { type: 'basic', email: 'test@example.com', apiKey: 'test-key' },
      userAgent: 'ms_teams/1.0',
      headers: {
        userAgentMS: 'ms_teams1.0',
        'X-Custom': 'value',
      },
    });

    await client.get({ url: '/projects' });
    await client.get({ url: '/tasks' });

    expect(mockFetch).toHaveBeenCalledTimes(2);
    for (const call of mockFetch.mock.calls) {
      const request = call[0] as Request;
      expect(request.headers.get('userAgentMS')).toBe('ms_teams1.0');
      expect(request.headers.get('X-Custom')).toBe('value');
      // User-Agent from `userAgent` still wins when not overridden in headers
      expect(request.headers.get('User-Agent')).toBe('ms_teams/1.0');
    }
  });

  it('per-request headers override configured default headers', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = createFreelo({
      auth: { type: 'basic', email: 'test@example.com', apiKey: 'test-key' },
      userAgent: 'Test/1.0',
      headers: { 'X-Custom': 'default' },
    });

    await client.get({
      url: '/projects',
      headers: { 'X-Custom': 'override' },
    });

    const request = mockFetch.mock.calls[0][0] as Request;
    expect(request.headers.get('X-Custom')).toBe('override');
  });

  it('config headers do not override built-in User-Agent or Authorization', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = createFreelo({
      auth: { type: 'basic', email: 'test@example.com', apiKey: 'test-key' },
      userAgent: 'Test/1.0',
      headers: {
        'User-Agent': 'ShouldBeIgnored/2.0',
        Authorization: 'Bearer should-be-ignored',
      },
    });

    await client.get({ url: '/projects' });

    const request = mockFetch.mock.calls[0][0] as Request;
    expect(request.headers.get('User-Agent')).toBe('Test/1.0');
    expect(request.headers.get('Authorization')).toBe(
      `Basic ${btoa('test@example.com:test-key')}`,
    );
  });

  it('applies default headers on OAuth clients', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = createFreelo({
      auth: {
        type: 'oauth',
        accessToken: 'jwt',
        refreshToken: 'refresh',
        clientId: 'my-app',
        expiresAt: Date.now() + 3600 * 1000,
      },
      userAgent: 'OAuthApp/1.0',
      headers: { userAgentMS: 'ms_teams1.0' },
    });

    await client.get({ url: '/projects' });

    const request = mockFetch.mock.calls[0][0] as Request;
    expect(request.headers.get('userAgentMS')).toBe('ms_teams1.0');
  });

  it('enables logging when configured', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    mockFetch.mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = createFreelo({
      auth: { type: 'basic', email: 'test@example.com', apiKey: 'test-key' },
      userAgent: 'Test/1.0',
      logging: true,
    });

    await client.get({
      url: '/projects',
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Freelo]'),
    );

    consoleSpy.mockRestore();
  });

  it('does not log when logging is disabled', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    mockFetch.mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = createFreelo({
      auth: { type: 'basic', email: 'test@example.com', apiKey: 'test-key' },
      userAgent: 'Test/1.0',
      logging: false,
    });

    await client.get({
      url: '/projects',
    });

    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('warns on rate limit (429) response', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    mockFetch.mockResolvedValue(
      new Response('Rate limited', {
        status: 429,
        headers: { 'Content-Type': 'text/plain' },
      }),
    );

    const client = createFreelo({
      auth: { type: 'basic', email: 'test@example.com', apiKey: 'test-key' },
      userAgent: 'Test/1.0',
    });

    await client.get({
      url: '/projects',
    });

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Rate limited'),
    );

    warnSpy.mockRestore();
  });

  it('supports per-request client for multi-tenant', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    const client1 = createFreelo({
      auth: { type: 'basic', email: 'user1@example.com', apiKey: 'key1' },
      userAgent: 'Test/1.0',
    });

    const client2 = createFreelo({
      auth: { type: 'basic', email: 'user2@example.com', apiKey: 'key2' },
      userAgent: 'Test/1.0',
    });

    await client1.get({ url: '/projects' });
    await client2.get({ url: '/projects' });

    const request1 = mockFetch.mock.calls[0][0] as Request;
    const request2 = mockFetch.mock.calls[1][0] as Request;

    const creds1 = btoa('user1@example.com:key1');
    const creds2 = btoa('user2@example.com:key2');

    expect(request1.headers.get('Authorization')).toBe(`Basic ${creds1}`);
    expect(request2.headers.get('Authorization')).toBe(`Basic ${creds2}`);
  });

  it('supports mixed auth types across clients', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    const basicClient = createFreelo({
      auth: { type: 'basic', email: 'user@example.com', apiKey: 'key' },
      userAgent: 'MyApp/1.0',
    });

    const bearerClient = createFreelo({
      auth: { type: 'bearer', token: 'jwt-token-123' },
      userAgent: 'ms-teams',
    });

    await basicClient.get({ url: '/projects' });
    await bearerClient.get({ url: '/projects' });

    const request1 = mockFetch.mock.calls[0][0] as Request;
    const request2 = mockFetch.mock.calls[1][0] as Request;

    expect(request1.headers.get('Authorization')).toBe(
      `Basic ${btoa('user@example.com:key')}`,
    );
    expect(request2.headers.get('Authorization')).toBe('Bearer jwt-token-123');
    expect(request2.headers.get('User-Agent')).toBe('ms-teams');
  });

  it('sets Bearer header with OAuth access token', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = createFreelo({
      auth: {
        type: 'oauth',
        accessToken: 'jwt-access-token',
        refreshToken: 'refresh-token',
        clientId: 'my-app',
        expiresAt: Date.now() + 3600 * 1000, // 1 hour from now
      },
      userAgent: 'OAuthApp/1.0',
    });

    await client.get({ url: '/projects' });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const request = mockFetch.mock.calls[0][0] as Request;
    expect(request.headers.get('Authorization')).toBe('Bearer jwt-access-token');
    expect(request.headers.get('User-Agent')).toBe('OAuthApp/1.0');
  });

  it('proactively refreshes OAuth token before request when near expiry', async () => {
    let callCount = 0;
    mockFetch.mockImplementation((input: string | Request) => {
      const url = typeof input === 'string' ? input : input.url;
      callCount++;

      // First call: token refresh
      if (url.includes('/oauth/token')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              access_token: 'new-jwt-token',
              token_type: 'Bearer',
              expires_in: 3600,
              refresh_token: 'new-refresh-token',
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          ),
        );
      }

      // Second call: actual API request
      return Promise.resolve(
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    const onTokenRefreshed = vi.fn();

    const client = createFreelo({
      auth: {
        type: 'oauth',
        accessToken: 'old-jwt-token',
        refreshToken: 'old-refresh-token',
        clientId: 'my-app',
        expiresAt: Date.now() + 10_000, // Expires in 10s (within 30s buffer)
        onTokenRefreshed,
      },
      userAgent: 'OAuthApp/1.0',
    });

    await client.get({ url: '/projects' });

    // Should have called refresh endpoint first, then the API
    expect(mockFetch).toHaveBeenCalledTimes(2);

    // Verify refresh was called
    const refreshUrl = typeof mockFetch.mock.calls[0][0] === 'string'
      ? mockFetch.mock.calls[0][0]
      : mockFetch.mock.calls[0][0].url;
    expect(refreshUrl).toBe(`${DEFAULT_OAUTH_ISSUER}/oauth/token`);

    // Verify the API request used the new token
    const apiRequest = mockFetch.mock.calls[1][0] as Request;
    expect(apiRequest.headers.get('Authorization')).toBe('Bearer new-jwt-token');

    // Verify callback was called
    expect(onTokenRefreshed).toHaveBeenCalledWith({
      accessToken: 'new-jwt-token',
      refreshToken: 'new-refresh-token',
      expiresAt: expect.any(Number),
    });
  });

  it('retries on 401 after successful OAuth token refresh', async () => {
    let apiCallCount = 0;
    mockFetch.mockImplementation((input: string | Request) => {
      const url = typeof input === 'string' ? input : input.url;

      // Token refresh endpoint
      if (url.includes('/oauth/token')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              access_token: 'refreshed-jwt',
              token_type: 'Bearer',
              expires_in: 3600,
              refresh_token: 'refreshed-refresh',
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          ),
        );
      }

      // API endpoint
      apiCallCount++;
      if (apiCallCount === 1) {
        // First API call: 401
        return Promise.resolve(
          new Response(JSON.stringify({ message: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }),
        );
      }

      // Retry: success
      return Promise.resolve(
        new Response(JSON.stringify({ id: 1, name: 'Project' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    const client = createFreelo({
      auth: {
        type: 'oauth',
        accessToken: 'expired-jwt',
        refreshToken: 'valid-refresh',
        clientId: 'my-app',
        // No expiresAt — reactive refresh only
      },
      userAgent: 'OAuthApp/1.0',
    });

    await client.get({ url: '/projects' });

    // 1st: API call (401) → 2nd: refresh token → 3rd: retry API call (200)
    expect(mockFetch).toHaveBeenCalledTimes(3);

    // Verify the retry used the refreshed token
    const retryRequest = mockFetch.mock.calls[2][0] as Request;
    expect(retryRequest.headers.get('Authorization')).toBe('Bearer refreshed-jwt');
  });

  it('does not retry on 401 when refresh fails', async () => {
    mockFetch.mockImplementation((input: string | Request) => {
      const url = typeof input === 'string' ? input : input.url;

      // Token refresh fails
      if (url.includes('/oauth/token')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({ error: 'invalid_grant' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } },
          ),
        );
      }

      // API: 401
      return Promise.resolve(
        new Response(JSON.stringify({ message: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    const client = createFreelo({
      auth: {
        type: 'oauth',
        accessToken: 'expired-jwt',
        refreshToken: 'revoked-refresh',
        clientId: 'my-app',
      },
      userAgent: 'OAuthApp/1.0',
    });

    await client.get({ url: '/projects' });

    // 1st: API call (401) → 2nd: refresh attempt (fails) → no retry
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('preserves POST body on OAuth 401 retry', async () => {
    let apiCallCount = 0;
    mockFetch.mockImplementation((input: string | Request) => {
      const url = typeof input === 'string' ? input : input.url;

      if (url.includes('/oauth/token')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              access_token: 'refreshed-jwt',
              token_type: 'Bearer',
              expires_in: 3600,
              refresh_token: 'refreshed-refresh',
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          ),
        );
      }

      apiCallCount++;
      if (apiCallCount === 1) {
        return Promise.resolve(
          new Response(JSON.stringify({ message: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }),
        );
      }

      return Promise.resolve(
        new Response(JSON.stringify({ id: 1, name: 'New Task' }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    const client = createFreelo({
      auth: {
        type: 'oauth',
        accessToken: 'expired-jwt',
        refreshToken: 'valid-refresh',
        clientId: 'my-app',
      },
      userAgent: 'OAuthApp/1.0',
    });

    await client.post({
      url: '/tasklist/{tasklist_id}/tasks',
      path: { tasklist_id: 5 },
      body: { name: 'New Task', worker_ids: [1] },
    });

    // 1st: POST (401) → 2nd: refresh → 3rd: retry POST (201)
    expect(mockFetch).toHaveBeenCalledTimes(3);

    // Verify retried request has the body
    const retryRequest = mockFetch.mock.calls[2][0] as Request;
    const retryBody = await retryRequest.text();
    expect(JSON.parse(retryBody)).toEqual({ name: 'New Task', worker_ids: [1] });
    expect(retryRequest.headers.get('Authorization')).toBe('Bearer refreshed-jwt');
  });
});

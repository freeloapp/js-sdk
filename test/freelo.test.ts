import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createFreelo } from '../src/freelo';

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
      email: 'test@example.com',
      apiKey: 'test-key',
      userAgent: 'Test/1.0',
    });

    const config = client.getConfig();
    expect(config.baseUrl).toBe('https://api.freelo.io/v1');
  });

  it('uses custom baseUrl when provided', () => {
    const client = createFreelo({
      email: 'test@example.com',
      apiKey: 'test-key',
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
      email: 'test@example.com',
      apiKey: 'test-key',
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

  it('sets User-Agent header on requests', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = createFreelo({
      email: 'test@example.com',
      apiKey: 'test-key',
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

  it('enables logging when configured', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    mockFetch.mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = createFreelo({
      email: 'test@example.com',
      apiKey: 'test-key',
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
      email: 'test@example.com',
      apiKey: 'test-key',
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
      email: 'test@example.com',
      apiKey: 'test-key',
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
      email: 'user1@example.com',
      apiKey: 'key1',
      userAgent: 'Test/1.0',
    });

    const client2 = createFreelo({
      email: 'user2@example.com',
      apiKey: 'key2',
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
});

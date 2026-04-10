import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateCodeVerifier,
  generateCodeChallenge,
  generatePKCEChallenge,
  buildAuthorizationUrl,
  exchangeCode,
  refreshAccessToken,
  revokeToken,
  discoverOAuthServer,
  maybeRefreshToken,
  tryRefreshToken,
  OAuthTokenError,
  DEFAULT_OAUTH_ISSUER,
} from '../src/oauth';
import type { OAuthAuth } from '../src/oauth';

describe('PKCE helpers', () => {
  it('generates a code verifier of default length (128)', () => {
    const verifier = generateCodeVerifier();
    expect(verifier).toHaveLength(128);
  });

  it('generates a code verifier of custom length', () => {
    const verifier = generateCodeVerifier(43);
    expect(verifier).toHaveLength(43);
  });

  it('throws on invalid length', () => {
    expect(() => generateCodeVerifier(42)).toThrow(RangeError);
    expect(() => generateCodeVerifier(129)).toThrow(RangeError);
  });

  it('uses only valid PKCE characters', () => {
    const verifier = generateCodeVerifier();
    expect(verifier).toMatch(/^[A-Za-z0-9\-._~]+$/);
  });

  it('generates different verifiers each time', () => {
    const a = generateCodeVerifier();
    const b = generateCodeVerifier();
    expect(a).not.toBe(b);
  });

  it('generates a valid base64url code challenge', async () => {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    // base64url: no +, /, or = characters
    expect(challenge).toMatch(/^[A-Za-z0-9\-_]+$/);
    // SHA-256 produces 32 bytes → 43 base64url characters (without padding)
    expect(challenge).toHaveLength(43);
  });

  it('produces deterministic challenge for the same verifier', async () => {
    const verifier = 'test-verifier-value-that-is-long-enough-for-testing-purposes';
    const a = await generateCodeChallenge(verifier);
    const b = await generateCodeChallenge(verifier);
    expect(a).toBe(b);
  });

  it('generates both verifier and challenge via generatePKCEChallenge', async () => {
    const pkce = await generatePKCEChallenge();
    expect(pkce.codeVerifier).toHaveLength(128);
    expect(pkce.codeChallenge).toHaveLength(43);
    // Verify they are consistent
    const challenge = await generateCodeChallenge(pkce.codeVerifier);
    expect(pkce.codeChallenge).toBe(challenge);
  });

  it('generates PKCE challenge with custom length', async () => {
    const pkce = await generatePKCEChallenge(64);
    expect(pkce.codeVerifier).toHaveLength(64);
    expect(pkce.codeChallenge).toHaveLength(43);
  });
});

describe('buildAuthorizationUrl', () => {
  it('builds URL with all required parameters', () => {
    const url = buildAuthorizationUrl({
      clientId: 'my-app',
      redirectUri: 'https://myapp.com/callback',
      codeChallenge: 'abc123challenge',
    });

    const parsed = new URL(url);
    expect(parsed.origin).toBe(DEFAULT_OAUTH_ISSUER);
    expect(parsed.pathname).toBe('/authorize');
    expect(parsed.searchParams.get('client_id')).toBe('my-app');
    expect(parsed.searchParams.get('response_type')).toBe('code');
    expect(parsed.searchParams.get('redirect_uri')).toBe('https://myapp.com/callback');
    expect(parsed.searchParams.get('code_challenge')).toBe('abc123challenge');
    expect(parsed.searchParams.get('code_challenge_method')).toBe('S256');
  });

  it('uses custom issuer URL', () => {
    const url = buildAuthorizationUrl({
      clientId: 'my-app',
      redirectUri: 'https://myapp.com/callback',
      codeChallenge: 'abc123',
      issuerUrl: 'https://custom.identity.com',
    });

    const parsed = new URL(url);
    expect(parsed.origin).toBe('https://custom.identity.com');
  });

  it('includes scope as space-separated string from array', () => {
    const url = buildAuthorizationUrl({
      clientId: 'my-app',
      redirectUri: 'https://myapp.com/callback',
      codeChallenge: 'abc123',
      scope: ['read', 'write', 'projects'],
    });

    const parsed = new URL(url);
    expect(parsed.searchParams.get('scope')).toBe('read write projects');
  });

  it('includes scope as string directly', () => {
    const url = buildAuthorizationUrl({
      clientId: 'my-app',
      redirectUri: 'https://myapp.com/callback',
      codeChallenge: 'abc123',
      scope: 'read write',
    });

    const parsed = new URL(url);
    expect(parsed.searchParams.get('scope')).toBe('read write');
  });

  it('includes state when provided', () => {
    const url = buildAuthorizationUrl({
      clientId: 'my-app',
      redirectUri: 'https://myapp.com/callback',
      codeChallenge: 'abc123',
      state: 'random-csrf-token',
    });

    const parsed = new URL(url);
    expect(parsed.searchParams.get('state')).toBe('random-csrf-token');
  });

  it('omits scope and state when not provided', () => {
    const url = buildAuthorizationUrl({
      clientId: 'my-app',
      redirectUri: 'https://myapp.com/callback',
      codeChallenge: 'abc123',
    });

    const parsed = new URL(url);
    expect(parsed.searchParams.has('scope')).toBe(false);
    expect(parsed.searchParams.has('state')).toBe(false);
  });
});

describe('exchangeCode', () => {
  const mockFetch = vi.fn();
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = mockFetch;
    mockFetch.mockReset();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('sends correct POST body to token endpoint', async () => {
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: 'jwt-token',
          token_type: 'Bearer',
          expires_in: 3600,
          refresh_token: 'refresh-abc',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    await exchangeCode({
      code: 'auth-code-123',
      codeVerifier: 'verifier-xyz',
      clientId: 'my-app',
      redirectUri: 'https://myapp.com/callback',
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe(`${DEFAULT_OAUTH_ISSUER}/oauth/token`);
    expect(init.method).toBe('POST');

    const body = new URLSearchParams(init.body);
    expect(body.get('grant_type')).toBe('authorization_code');
    expect(body.get('client_id')).toBe('my-app');
    expect(body.get('code')).toBe('auth-code-123');
    expect(body.get('code_verifier')).toBe('verifier-xyz');
    expect(body.get('redirect_uri')).toBe('https://myapp.com/callback');
  });

  it('parses token response into camelCase shape', async () => {
    const now = Date.now();
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: 'jwt-token',
          token_type: 'Bearer',
          expires_in: 3600,
          refresh_token: 'refresh-abc',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const result = await exchangeCode({
      code: 'auth-code-123',
      codeVerifier: 'verifier-xyz',
      clientId: 'my-app',
      redirectUri: 'https://myapp.com/callback',
    });

    expect(result.accessToken).toBe('jwt-token');
    expect(result.tokenType).toBe('Bearer');
    expect(result.expiresIn).toBe(3600);
    expect(result.refreshToken).toBe('refresh-abc');
    expect(result.expiresAt).toBeGreaterThanOrEqual(now + 3600 * 1000);
  });

  it('throws OAuthTokenError with statusCode and detail on JSON error', async () => {
    const errorBody = { error: 'invalid_grant', error_description: 'Code expired' };
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify(errorBody),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    try {
      await exchangeCode({
        code: 'expired-code',
        codeVerifier: 'verifier',
        clientId: 'my-app',
        redirectUri: 'https://myapp.com/callback',
      });
      expect.unreachable('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(OAuthTokenError);
      const oauthErr = err as OAuthTokenError;
      expect(oauthErr.statusCode).toBe(400);
      expect(oauthErr.detail).toEqual(errorBody);
      expect(oauthErr.name).toBe('OAuthTokenError');
    }
  });

  it('throws OAuthTokenError with raw text detail on non-JSON error', async () => {
    mockFetch.mockResolvedValue(
      new Response('Internal Server Error', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
      }),
    );

    try {
      await exchangeCode({
        code: 'code',
        codeVerifier: 'verifier',
        clientId: 'my-app',
        redirectUri: 'https://myapp.com/callback',
      });
      expect.unreachable('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(OAuthTokenError);
      const oauthErr = err as OAuthTokenError;
      expect(oauthErr.statusCode).toBe(500);
      expect(oauthErr.detail).toBe('Internal Server Error');
    }
  });

  it('uses custom issuer URL', async () => {
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: 'jwt',
          token_type: 'Bearer',
          expires_in: 3600,
          refresh_token: 'ref',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    await exchangeCode({
      code: 'code',
      codeVerifier: 'verifier',
      clientId: 'app',
      redirectUri: 'https://app.com/cb',
      issuerUrl: 'https://custom.identity.com',
    });

    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe('https://custom.identity.com/oauth/token');
  });
});

describe('refreshAccessToken', () => {
  const mockFetch = vi.fn();
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = mockFetch;
    mockFetch.mockReset();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('sends correct POST body with grant_type=refresh_token', async () => {
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: 'new-jwt',
          token_type: 'Bearer',
          expires_in: 3600,
          refresh_token: 'new-refresh',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const result = await refreshAccessToken({
      refreshToken: 'old-refresh',
      clientId: 'my-app',
    });

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe(`${DEFAULT_OAUTH_ISSUER}/oauth/token`);
    const body = new URLSearchParams(init.body);
    expect(body.get('grant_type')).toBe('refresh_token');
    expect(body.get('client_id')).toBe('my-app');
    expect(body.get('refresh_token')).toBe('old-refresh');

    expect(result.accessToken).toBe('new-jwt');
    expect(result.refreshToken).toBe('new-refresh');
  });

  it('throws OAuthTokenError on error response', async () => {
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({ error: 'invalid_grant' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    await expect(
      refreshAccessToken({ refreshToken: 'revoked', clientId: 'my-app' }),
    ).rejects.toThrow(OAuthTokenError);
  });

  it('uses custom issuer URL', async () => {
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: 'jwt',
          token_type: 'Bearer',
          expires_in: 3600,
          refresh_token: 'ref',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    await refreshAccessToken({
      refreshToken: 'token',
      clientId: 'app',
      issuerUrl: 'https://custom.identity.com',
    });

    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe('https://custom.identity.com/oauth/token');
  });
});

describe('revokeToken', () => {
  const mockFetch = vi.fn();
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = mockFetch;
    mockFetch.mockReset();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('sends correct POST body to revoke endpoint', async () => {
    mockFetch.mockResolvedValue(new Response(null, { status: 200 }));

    await revokeToken({
      token: 'some-token',
      clientId: 'my-app',
    });

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe(`${DEFAULT_OAUTH_ISSUER}/oauth/revoke`);
    expect(init.method).toBe('POST');
    const body = new URLSearchParams(init.body);
    expect(body.get('token')).toBe('some-token');
    expect(body.get('client_id')).toBe('my-app');
    expect(body.has('token_type_hint')).toBe(false);
  });

  it('includes token_type_hint when provided', async () => {
    mockFetch.mockResolvedValue(new Response(null, { status: 200 }));

    await revokeToken({
      token: 'some-token',
      tokenTypeHint: 'refresh_token',
      clientId: 'my-app',
    });

    const body = new URLSearchParams(mockFetch.mock.calls[0][1].body);
    expect(body.get('token_type_hint')).toBe('refresh_token');
  });

  it('uses custom issuer URL', async () => {
    mockFetch.mockResolvedValue(new Response(null, { status: 200 }));

    await revokeToken({
      token: 'some-token',
      clientId: 'my-app',
      issuerUrl: 'https://custom.identity.com',
    });

    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe('https://custom.identity.com/oauth/revoke');
  });
});

describe('discoverOAuthServer', () => {
  const mockFetch = vi.fn();
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = mockFetch;
    mockFetch.mockReset();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('fetches and parses metadata from well-known endpoint', async () => {
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          issuer: 'https://identity.freelo.io',
          authorization_endpoint: 'https://identity.freelo.io/authorize',
          token_endpoint: 'https://identity.freelo.io/oauth/token',
          revocation_endpoint: 'https://identity.freelo.io/oauth/revoke',
          scopes_supported: ['read', 'write', 'projects'],
          code_challenge_methods_supported: ['S256'],
          grant_types_supported: ['authorization_code', 'refresh_token'],
          response_types_supported: ['code'],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const metadata = await discoverOAuthServer();

    expect(mockFetch).toHaveBeenCalledWith(
      `${DEFAULT_OAUTH_ISSUER}/.well-known/oauth-authorization-server`,
    );
    expect(metadata.issuer).toBe('https://identity.freelo.io');
    expect(metadata.authorizationEndpoint).toBe('https://identity.freelo.io/authorize');
    expect(metadata.tokenEndpoint).toBe('https://identity.freelo.io/oauth/token');
    expect(metadata.revocationEndpoint).toBe('https://identity.freelo.io/oauth/revoke');
    expect(metadata.scopesSupported).toEqual(['read', 'write', 'projects']);
    expect(metadata.codeChallengeMethodsSupported).toEqual(['S256']);
    expect(metadata.grantTypesSupported).toEqual(['authorization_code', 'refresh_token']);
    expect(metadata.responseTypesSupported).toEqual(['code']);
  });

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValue(new Response(null, { status: 404 }));

    await expect(discoverOAuthServer()).rejects.toThrow('OAuth discovery failed (404)');
  });

  it('uses custom issuer URL', async () => {
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          issuer: 'https://custom.com',
          authorization_endpoint: 'https://custom.com/authorize',
          token_endpoint: 'https://custom.com/oauth/token',
          revocation_endpoint: 'https://custom.com/oauth/revoke',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    await discoverOAuthServer('https://custom.com');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://custom.com/.well-known/oauth-authorization-server',
    );
  });

  it('defaults missing optional arrays to empty', async () => {
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          issuer: 'https://identity.freelo.io',
          authorization_endpoint: 'https://identity.freelo.io/authorize',
          token_endpoint: 'https://identity.freelo.io/oauth/token',
          revocation_endpoint: 'https://identity.freelo.io/oauth/revoke',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const metadata = await discoverOAuthServer();
    expect(metadata.scopesSupported).toEqual([]);
    expect(metadata.codeChallengeMethodsSupported).toEqual([]);
    expect(metadata.grantTypesSupported).toEqual([]);
    expect(metadata.responseTypesSupported).toEqual([]);
  });
});

describe('maybeRefreshToken', () => {
  const mockFetch = vi.fn();
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = mockFetch;
    mockFetch.mockReset();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  function makeAuth(overrides: Partial<OAuthAuth> = {}): OAuthAuth {
    return {
      type: 'oauth',
      accessToken: 'old-jwt',
      refreshToken: 'old-refresh',
      clientId: 'my-app',
      ...overrides,
    };
  }

  function mockTokenResponse() {
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: 'new-jwt',
          token_type: 'Bearer',
          expires_in: 3600,
          refresh_token: 'new-refresh',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
  }

  it('does nothing when expiresAt is not set', async () => {
    const auth = makeAuth();
    await maybeRefreshToken(auth);
    expect(mockFetch).not.toHaveBeenCalled();
    expect(auth.accessToken).toBe('old-jwt');
  });

  it('does nothing when token is not near expiry', async () => {
    const auth = makeAuth({ expiresAt: Date.now() + 120_000 }); // 2 min from now
    await maybeRefreshToken(auth);
    expect(mockFetch).not.toHaveBeenCalled();
    expect(auth.accessToken).toBe('old-jwt');
  });

  it('refreshes when token expires within 30s buffer', async () => {
    mockTokenResponse();
    const auth = makeAuth({ expiresAt: Date.now() + 10_000 }); // 10s from now
    await maybeRefreshToken(auth);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(auth.accessToken).toBe('new-jwt');
    expect(auth.refreshToken).toBe('new-refresh');
  });

  it('calls onTokenRefreshed callback after refresh', async () => {
    mockTokenResponse();
    const onTokenRefreshed = vi.fn();
    const auth = makeAuth({
      expiresAt: Date.now() + 5_000,
      onTokenRefreshed,
    });
    await maybeRefreshToken(auth);
    expect(onTokenRefreshed).toHaveBeenCalledWith({
      accessToken: 'new-jwt',
      refreshToken: 'new-refresh',
      expiresAt: expect.any(Number),
    });
  });
});

describe('tryRefreshToken', () => {
  const mockFetch = vi.fn();
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = mockFetch;
    mockFetch.mockReset();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('returns true and updates auth on successful refresh', async () => {
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: 'new-jwt',
          token_type: 'Bearer',
          expires_in: 3600,
          refresh_token: 'new-refresh',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const auth: OAuthAuth = {
      type: 'oauth',
      accessToken: 'old-jwt',
      refreshToken: 'old-refresh',
      clientId: 'my-app',
    };

    const result = await tryRefreshToken(auth);
    expect(result).toBe(true);
    expect(auth.accessToken).toBe('new-jwt');
  });

  it('returns false and does not call onTokenRefreshed on failure', async () => {
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({ error: 'invalid_grant' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const onTokenRefreshed = vi.fn();
    const auth: OAuthAuth = {
      type: 'oauth',
      accessToken: 'old-jwt',
      refreshToken: 'revoked-refresh',
      clientId: 'my-app',
      onTokenRefreshed,
    };

    const result = await tryRefreshToken(auth);
    expect(result).toBe(false);
    expect(auth.accessToken).toBe('old-jwt'); // unchanged
    expect(onTokenRefreshed).not.toHaveBeenCalled();
  });

  it('deduplicates concurrent refresh calls', async () => {
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: 'new-jwt',
          token_type: 'Bearer',
          expires_in: 3600,
          refresh_token: 'new-refresh',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const auth: OAuthAuth = {
      type: 'oauth',
      accessToken: 'old-jwt',
      refreshToken: 'old-refresh',
      clientId: 'my-app',
    };

    // Fire two concurrent refreshes for the same auth object
    const [result1, result2] = await Promise.all([
      tryRefreshToken(auth),
      tryRefreshToken(auth),
    ]);

    expect(result1).toBe(true);
    expect(result2).toBe(true);
    // Only one actual fetch call to the token endpoint
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

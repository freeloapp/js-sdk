/** Default OAuth issuer URL for Freelo identity provider. */
export const DEFAULT_OAUTH_ISSUER = 'https://identity.freelo.io';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** OAuth 2.1 auth with automatic token refresh. */
export interface OAuthAuth {
  type: 'oauth';
  /** Current access token (JWT). Mutated in-place on refresh. */
  accessToken: string;
  /** Refresh token (opaque string). Mutated in-place on refresh. */
  refreshToken: string;
  /** Client ID registered with the identity provider. */
  clientId: string;
  /** Token expiration time (epoch ms). Enables proactive refresh when set. */
  expiresAt?: number;
  /** OAuth issuer base URL. Defaults to {@link DEFAULT_OAUTH_ISSUER}. */
  issuerUrl?: string;
  /**
   * Called after tokens are refreshed so the consumer can persist them.
   * If not provided, tokens are only updated in-memory.
   */
  onTokenRefreshed?: (tokens: OAuthTokens) => void | Promise<void>;
}

/** Refreshed token set returned via {@link OAuthAuth.onTokenRefreshed}. */
export interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  /** Expiration time (epoch ms). */
  expiresAt: number;
}

/** PKCE code verifier + challenge pair. */
export interface PKCEChallenge {
  codeVerifier: string;
  codeChallenge: string;
}

/** Parameters for {@link buildAuthorizationUrl}. */
export interface AuthorizationUrlParams {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  /** Space-separated string or array of scopes. */
  scope?: string | string[];
  /** Opaque state value for CSRF protection. */
  state?: string;
  /** OAuth issuer base URL. Defaults to {@link DEFAULT_OAUTH_ISSUER}. */
  issuerUrl?: string;
}

/** Parameters for {@link exchangeCode}. */
export interface TokenExchangeParams {
  code: string;
  codeVerifier: string;
  clientId: string;
  redirectUri: string;
  /** OAuth issuer base URL. Defaults to {@link DEFAULT_OAUTH_ISSUER}. */
  issuerUrl?: string;
}

/** Token endpoint response (camelCase). */
export interface TokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken: string;
  /** Computed: `Date.now() + expiresIn * 1000`. */
  expiresAt: number;
}

/** Parameters for {@link refreshAccessToken}. */
export interface RefreshTokenParams {
  refreshToken: string;
  clientId: string;
  /** OAuth issuer base URL. Defaults to {@link DEFAULT_OAUTH_ISSUER}. */
  issuerUrl?: string;
}

/** Parameters for {@link revokeToken}. */
export interface RevokeTokenParams {
  token: string;
  tokenTypeHint?: 'access_token' | 'refresh_token';
  clientId: string;
  /** OAuth issuer base URL. Defaults to {@link DEFAULT_OAUTH_ISSUER}. */
  issuerUrl?: string;
}

/** OAuth Authorization Server Metadata (RFC 8414). */
export interface OAuthServerMetadata {
  issuer: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  revocationEndpoint: string;
  scopesSupported: string[];
  codeChallengeMethodsSupported: string[];
  grantTypesSupported: string[];
  responseTypesSupported: string[];
}

// ---------------------------------------------------------------------------
// PKCE helpers
// ---------------------------------------------------------------------------

const PKCE_CHARSET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

/**
 * Generate a cryptographically random PKCE code verifier.
 * @param length Character count (43–128, default 128).
 */
export function generateCodeVerifier(length = 128): string {
  if (length < 43 || length > 128) {
    throw new RangeError('PKCE code verifier length must be between 43 and 128');
  }
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let verifier = '';
  for (const byte of bytes) {
    verifier += PKCE_CHARSET[byte % PKCE_CHARSET.length];
  }
  return verifier;
}

/** Base64url-encode a buffer (no padding). */
function base64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Derive a S256 code challenge from a verifier.
 * Uses Web Crypto API (`crypto.subtle`).
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoded = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return base64url(digest);
}

/** Generate a PKCE verifier + challenge pair in one call. */
export async function generatePKCEChallenge(length = 128): Promise<PKCEChallenge> {
  const codeVerifier = generateCodeVerifier(length);
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  return { codeVerifier, codeChallenge };
}

// ---------------------------------------------------------------------------
// Authorization URL builder
// ---------------------------------------------------------------------------

/** Build the full authorization URL for initiating the OAuth flow. */
export function buildAuthorizationUrl(params: AuthorizationUrlParams): string {
  const issuer = params.issuerUrl ?? DEFAULT_OAUTH_ISSUER;
  const url = new URL('/authorize', issuer);

  url.searchParams.set('client_id', params.clientId);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('redirect_uri', params.redirectUri);
  url.searchParams.set('code_challenge', params.codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');

  const scope = Array.isArray(params.scope)
    ? params.scope.join(' ')
    : params.scope;
  if (scope) {
    url.searchParams.set('scope', scope);
  }

  if (params.state) {
    url.searchParams.set('state', params.state);
  }

  return url.toString();
}

// ---------------------------------------------------------------------------
// Token endpoint helpers (use native fetch directly)
// ---------------------------------------------------------------------------

/** POST to the token endpoint and return a parsed {@link TokenResponse}. */
async function tokenRequest(
  issuerUrl: string,
  body: Record<string, string>,
): Promise<TokenResponse> {
  const response = await fetch(new URL('/oauth/token', issuerUrl).toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body).toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    let detail: unknown;
    try {
      detail = JSON.parse(text);
    } catch {
      detail = text;
    }
    throw new OAuthTokenError(
      `Token request failed (${response.status})`,
      response.status,
      detail,
    );
  }

  const json = await response.json();
  return {
    accessToken: json.access_token,
    tokenType: json.token_type,
    expiresIn: json.expires_in,
    refreshToken: json.refresh_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
}

/** Error thrown by OAuth token endpoint calls. */
export class OAuthTokenError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly detail: unknown,
  ) {
    super(message);
    this.name = 'OAuthTokenError';
  }
}

/** Exchange an authorization code for tokens (Authorization Code Grant + PKCE). */
export async function exchangeCode(params: TokenExchangeParams): Promise<TokenResponse> {
  const issuer = params.issuerUrl ?? DEFAULT_OAUTH_ISSUER;
  return tokenRequest(issuer, {
    grant_type: 'authorization_code',
    client_id: params.clientId,
    code: params.code,
    code_verifier: params.codeVerifier,
    redirect_uri: params.redirectUri,
  });
}

/** Refresh an access token using a refresh token. */
export async function refreshAccessToken(params: RefreshTokenParams): Promise<TokenResponse> {
  const issuer = params.issuerUrl ?? DEFAULT_OAUTH_ISSUER;
  return tokenRequest(issuer, {
    grant_type: 'refresh_token',
    client_id: params.clientId,
    refresh_token: params.refreshToken,
  });
}

/** Revoke a token (access or refresh). */
export async function revokeToken(params: RevokeTokenParams): Promise<void> {
  const issuer = params.issuerUrl ?? DEFAULT_OAUTH_ISSUER;
  const body: Record<string, string> = {
    token: params.token,
    client_id: params.clientId,
  };
  if (params.tokenTypeHint) {
    body.token_type_hint = params.tokenTypeHint;
  }

  await fetch(new URL('/oauth/revoke', issuer).toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body).toString(),
  });
}

// ---------------------------------------------------------------------------
// Discovery (RFC 8414)
// ---------------------------------------------------------------------------

/** Fetch OAuth Authorization Server Metadata from the well-known endpoint. */
export async function discoverOAuthServer(
  issuerUrl: string = DEFAULT_OAUTH_ISSUER,
): Promise<OAuthServerMetadata> {
  const response = await fetch(
    new URL('/.well-known/oauth-authorization-server', issuerUrl).toString(),
  );

  if (!response.ok) {
    throw new Error(`OAuth discovery failed (${response.status})`);
  }

  const json = await response.json();
  return {
    issuer: json.issuer,
    authorizationEndpoint: json.authorization_endpoint,
    tokenEndpoint: json.token_endpoint,
    revocationEndpoint: json.revocation_endpoint,
    scopesSupported: json.scopes_supported ?? [],
    codeChallengeMethodsSupported: json.code_challenge_methods_supported ?? [],
    grantTypesSupported: json.grant_types_supported ?? [],
    responseTypesSupported: json.response_types_supported ?? [],
  };
}

// ---------------------------------------------------------------------------
// Auto-refresh internals (used by freelo.ts interceptors)
// ---------------------------------------------------------------------------

/** Pending refresh promises keyed by auth object — prevents duplicate refreshes. */
const pendingRefreshes = new WeakMap<OAuthAuth, Promise<OAuthTokens | null>>();

/** Buffer (ms) before expiration to trigger proactive refresh. */
const REFRESH_BUFFER_MS = 30_000;

/**
 * Proactive refresh: refresh token if it expires within {@link REFRESH_BUFFER_MS}.
 * No-op when `expiresAt` is not set.
 */
export async function maybeRefreshToken(auth: OAuthAuth): Promise<void> {
  if (!auth.expiresAt) return;
  if (Date.now() + REFRESH_BUFFER_MS < auth.expiresAt) return;
  await doRefresh(auth);
}

/**
 * Reactive refresh: attempt to refresh and return whether it succeeded.
 * Used after a 401 response.
 */
export async function tryRefreshToken(auth: OAuthAuth): Promise<boolean> {
  const result = await doRefresh(auth);
  return result !== null;
}

async function doRefresh(auth: OAuthAuth): Promise<OAuthTokens | null> {
  const existing = pendingRefreshes.get(auth);
  if (existing) return existing;

  const promise = (async (): Promise<OAuthTokens | null> => {
    try {
      const result = await refreshAccessToken({
        refreshToken: auth.refreshToken,
        clientId: auth.clientId,
        issuerUrl: auth.issuerUrl,
      });
      // Mutate in-place so all interceptor closures see updated values
      auth.accessToken = result.accessToken;
      auth.refreshToken = result.refreshToken;
      auth.expiresAt = result.expiresAt;

      const tokens: OAuthTokens = {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresAt: result.expiresAt,
      };
      await auth.onTokenRefreshed?.(tokens);
      return tokens;
    } catch {
      return null;
    } finally {
      pendingRefreshes.delete(auth);
    }
  })();

  pendingRefreshes.set(auth, promise);
  return promise;
}

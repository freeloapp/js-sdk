/**
 * HTTP Client for Freelo API
 * Handles authentication, rate limiting, and request/response processing
 */

/** HTTP client configuration */
export interface HttpClientConfig {
  email?: string;
  apiKey?: string;
  userAgent?: string;
  baseUrl: string;
  timeout?: number;
}

/** API error response */
export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

/** Freelo API Error class */
export class FreeloApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'FreeloApiError';
  }

  /** Check if error is due to rate limiting (429) */
  get isRateLimited(): boolean {
    return this.status === 429;
  }

  /** Check if error is due to unauthorized access (401) */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /** Check if error is due to resource not found (404) */
  get isNotFound(): boolean {
    return this.status === 404;
  }

  /** Check if error is a client error (4xx) */
  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /** Check if error is a server error (5xx) */
  get isServerError(): boolean {
    return this.status >= 500;
  }
}

/** Rate limit exceeded error */
export class RateLimitError extends FreeloApiError {
  constructor() {
    super('Rate limit exceeded. Please wait 60 seconds before retrying.', 429);
    this.name = 'RateLimitError';
  }
}

/** Request options */
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH';
  body?: unknown;
  params?: Record<string, string | number | boolean | string[] | number[] | undefined>;
}

/** Rate limit retry configuration */
export interface RateLimitConfig {
  /** Maximum number of retries on rate limit (default: 1) */
  maxRetries?: number;
  /** Delay in milliseconds before retrying (default: 60000 as per API docs) */
  retryDelay?: number;
}

/** File upload response from the API */
export interface FileUploadResponse {
  uuid: string;
  download_url: string;
  filename: string;
}

/** Helper to create a delay */
const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** Credentials that can be updated at runtime */
export interface HttpClientCredentials {
  email?: string;
  apiKey?: string;
  userAgent?: string;
}

/**
 * HTTP Client for making authenticated requests to Freelo API
 */
export class HttpClient {
  constructor(private config: HttpClientConfig) {}

  /**
   * Update credentials at runtime (email, apiKey, userAgent)
   */
  setCredentials(credentials: HttpClientCredentials): void {
    this.config = { ...this.config, ...credentials };
  }

  /**
   * Get a copy of the current configuration
   */
  getConfig(): HttpClientConfig {
    return { ...this.config };
  }

  /**
   * Compute Basic Auth header from current credentials.
   * Throws if email or apiKey are not set.
   */
  private getAuthHeader(): string {
    if (!this.config.email || !this.config.apiKey) {
      throw new FreeloApiError(
        'Credentials not set: email and apiKey are required. Use setCredentials() to provide them.',
        0
      );
    }
    return `Basic ${btoa(`${this.config.email}:${this.config.apiKey}`)}`;
  }

  /**
   * Get User-Agent header from current config.
   * Throws if userAgent is not set.
   */
  private getUserAgent(): string {
    if (!this.config.userAgent) {
      throw new FreeloApiError(
        'Credentials not set: userAgent is required. Use setCredentials() to provide it.',
        0
      );
    }
    return this.config.userAgent;
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(path: string, params?: RequestOptions['params']): string {
    const url = new URL(`${this.config.baseUrl}${path}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined) return;

        if (Array.isArray(value)) {
          // Handle array parameters (e.g., projects_ids[])
          value.forEach((v) => {
            url.searchParams.append(`${key}[]`, String(v));
          });
        } else {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Make an HTTP request to the Freelo API
   */
  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, params } = options;
    const url = this.buildUrl(path, params);

    const headers: HeadersInit = {
      'Authorization': this.getAuthHeader(),
      'User-Agent': this.getUserAgent(),
      'Accept': 'application/json',
    };

    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    // Add timeout if configured
    const controller = new AbortController();
    const timeout = this.config.timeout ?? 30000;
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    fetchOptions.signal = controller.signal;

    try {
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      // Handle rate limiting
      if (response.status === 429) {
        throw new RateLimitError();
      }

      // Handle errors
      if (!response.ok) {
        let errorData: { message?: string; errors?: Record<string, string[]> } = {};
        try {
          const json = await response.json() as { message?: string; errors?: Record<string, string[]> };
          errorData = json;
        } catch {
          // Response body might not be JSON
        }

        throw new FreeloApiError(
          errorData.message ?? `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.errors
        );
      }

      // Handle empty responses (e.g., 204 No Content)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return undefined as T;
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json() as T;
      }

      // Return text for non-JSON responses (e.g., CSV downloads)
      return (await response.text()) as unknown as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof FreeloApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new FreeloApiError('Request timed out', 408);
        }
        throw new FreeloApiError(error.message, 0);
      }

      throw new FreeloApiError('Unknown error occurred', 0);
    }
  }

  /**
   * Make a GET request
   */
  async get<T>(path: string, params?: RequestOptions['params']): Promise<T> {
    return this.request<T>(path, { method: 'GET', params });
  }

  /**
   * Make a POST request
   */
  async post<T>(path: string, body?: unknown, params?: RequestOptions['params']): Promise<T> {
    return this.request<T>(path, { method: 'POST', body, params });
  }

  /**
   * Make a PUT request
   */
  async put<T>(path: string, body?: unknown, params?: RequestOptions['params']): Promise<T> {
    return this.request<T>(path, { method: 'PUT', body, params });
  }

  /**
   * Make a PATCH request
   */
  async patch<T>(path: string, body?: unknown, params?: RequestOptions['params']): Promise<T> {
    return this.request<T>(path, { method: 'PATCH', body, params });
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: 'DELETE', body });
  }

  /**
   * Upload a file using multipart/form-data
   * @param path - API path (e.g., '/file/upload')
   * @param file - File to upload (Blob in browser, Buffer in Node.js)
   * @param filename - Filename for the uploaded file
   * @returns File upload response
   */
  async uploadFile(path: string, file: Blob | ArrayBuffer, filename: string): Promise<FileUploadResponse> {
    const url = this.buildUrl(path);

    // Create FormData and append file
    const formData = new FormData();

    // Handle both Blob (browser) and ArrayBuffer/Buffer (Node.js)
    if (file instanceof Blob) {
      formData.append('file', file, filename);
    } else {
      // For ArrayBuffer (Node.js Buffer), create a Blob
      const blob = new Blob([file]);
      formData.append('file', blob, filename);
    }

    const controller = new AbortController();
    const timeout = this.config.timeout ?? 30000;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'User-Agent': this.getUserAgent(),
          // Note: Don't set Content-Type for FormData - fetch will set it with boundary
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 429) {
        throw new RateLimitError();
      }

      if (!response.ok) {
        let errorData: { message?: string; errors?: Record<string, string[]> } = {};
        try {
          const json = (await response.json()) as { message?: string; errors?: Record<string, string[]> };
          errorData = json;
        } catch {
          // Response body might not be JSON
        }

        throw new FreeloApiError(
          errorData.message ?? `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.errors
        );
      }

      return (await response.json()) as FileUploadResponse;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof FreeloApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new FreeloApiError('Request timed out', 408);
        }
        throw new FreeloApiError(error.message, 0);
      }

      throw new FreeloApiError('Unknown error occurred', 0);
    }
  }

  /**
   * Make a request with automatic retry on rate limiting (429)
   * @param path - API path
   * @param options - Request options
   * @param rateLimitConfig - Rate limit retry configuration
   * @returns Response data
   */
  async requestWithRetry<T>(
    path: string,
    options: RequestOptions = {},
    rateLimitConfig?: RateLimitConfig
  ): Promise<T> {
    const maxRetries = rateLimitConfig?.maxRetries ?? 1;
    const retryDelay = rateLimitConfig?.retryDelay ?? 60000;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.request<T>(path, options);
      } catch (error) {
        if (error instanceof FreeloApiError && error.isRateLimited && attempt < maxRetries) {
          await sleep(retryDelay);
          continue;
        }
        throw error;
      }
    }

    // This should never be reached, but TypeScript needs it
    throw new FreeloApiError('Max retries exceeded', 429);
  }
}

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HttpClient, FreeloApiError, RateLimitError } from '../src/http.js';

describe('HttpClient', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  const originalFetch = global.fetch;

  const defaultConfig = {
    baseUrl: 'https://api.freelo.io/v1',
    email: 'test@example.com',
    apiKey: 'test-api-key',
    userAgent: 'TestApp/1.0 (test@example.com)',
  };

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    vi.resetAllMocks();
    global.fetch = originalFetch;
  });

  describe('constructor', () => {
    it('should create client with config', () => {
      const client = new HttpClient(defaultConfig);
      expect(client).toBeDefined();
    });
  });

  describe('request', () => {
    it('should make GET request with auth header', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ data: 'test' }),
      });

      const client = new HttpClient(defaultConfig);
      await client.get('/test');

      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.freelo.io/v1/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Basic'),
            'User-Agent': 'TestApp/1.0 (test@example.com)',
            'Accept': 'application/json',
          }),
        })
      );
    });

    it('should include auth header with base64 encoded credentials', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ data: 'test' }),
      });

      const client = new HttpClient(defaultConfig);
      await client.get('/test');

      const expectedCredentials = btoa('test@example.com:test-api-key');
      expect(fetchMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Basic ${expectedCredentials}`,
          }),
        })
      );
    });

    it('should make POST request with body', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ id: 1 }),
      });

      const client = new HttpClient(defaultConfig);
      await client.post('/projects', { name: 'Test Project' });

      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.freelo.io/v1/projects',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Test Project' }),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should make PUT request', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ id: 1 }),
      });

      const client = new HttpClient(defaultConfig);
      await client.put('/task/123', { name: 'Updated Task' });

      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.freelo.io/v1/task/123',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ name: 'Updated Task' }),
        })
      );
    });

    it('should make PATCH request', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ id: 1 }),
      });

      const client = new HttpClient(defaultConfig);
      await client.patch('/task/123', { name: 'Patched Task' });

      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.freelo.io/v1/task/123',
        expect.objectContaining({
          method: 'PATCH',
        })
      );
    });

    it('should make DELETE request', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ result: 'success' }),
      });

      const client = new HttpClient(defaultConfig);
      await client.delete('/project/123');

      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.freelo.io/v1/project/123',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('should handle query parameters', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve([]),
      });

      const client = new HttpClient(defaultConfig);
      await client.get('/projects', { order_by: 'name', order: 'asc', p: 1 });

      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.freelo.io/v1/projects?order_by=name&order=asc&p=1',
        expect.any(Object)
      );
    });

    it('should handle array query parameters', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve([]),
      });

      const client = new HttpClient(defaultConfig);
      await client.get('/reports', { projects_ids: [1, 2, 3] });

      // URL encoding converts [] to %5B%5D
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('projects_ids%5B%5D=1'),
        expect.any(Object)
      );
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('projects_ids%5B%5D=2'),
        expect.any(Object)
      );
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('projects_ids%5B%5D=3'),
        expect.any(Object)
      );
    });

    it('should skip undefined query parameters', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve([]),
      });

      const client = new HttpClient(defaultConfig);
      await client.get('/projects', { order_by: 'name', order: undefined });

      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.freelo.io/v1/projects?order_by=name',
        expect.any(Object)
      );
    });

    it('should return JSON response', async () => {
      const mockData = { id: 1, name: 'Test' };
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockData),
      });

      const client = new HttpClient(defaultConfig);
      const result = await client.get('/test');

      expect(result).toEqual(mockData);
    });

    it('should handle 204 No Content response', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 204,
        headers: new Headers({ 'content-length': '0' }),
      });

      const client = new HttpClient(defaultConfig);
      const result = await client.delete('/project/123');

      expect(result).toBeUndefined();
    });

    it('should handle text response for non-JSON content', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/csv' }),
        text: () => Promise.resolve('id,name\n1,Test'),
      });

      const client = new HttpClient(defaultConfig);
      const result = await client.get('/export');

      expect(result).toBe('id,name\n1,Test');
    });
  });

  describe('error handling', () => {
    it('should throw FreeloApiError on 404', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ message: 'Project not found' }),
      });

      const client = new HttpClient(defaultConfig);

      await expect(client.get('/project/999')).rejects.toThrow(FreeloApiError);
      await expect(client.get('/project/999')).rejects.toMatchObject({
        status: 404,
        message: 'Project not found',
      });
    });

    it('should throw FreeloApiError on 401', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
      });

      const client = new HttpClient(defaultConfig);

      try {
        await client.get('/projects');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(FreeloApiError);
        expect((error as FreeloApiError).isUnauthorized).toBe(true);
      }
    });

    it('should throw RateLimitError on 429', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: () => Promise.resolve({}),
      });

      const client = new HttpClient(defaultConfig);

      await expect(client.get('/projects')).rejects.toThrow(RateLimitError);
    });

    it('should include validation errors in FreeloApiError', async () => {
      const errors = {
        name: ['Name is required', 'Name must be at least 3 characters'],
        currency_iso: ['Currency is invalid'],
      };

      fetchMock.mockResolvedValue({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        json: () => Promise.resolve({ message: 'Validation failed', errors }),
      });

      const client = new HttpClient(defaultConfig);

      try {
        await client.post('/projects', {});
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(FreeloApiError);
        expect((error as FreeloApiError).errors).toEqual(errors);
      }
    });

    it('should handle non-JSON error response', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('Not JSON')),
      });

      const client = new HttpClient(defaultConfig);

      await expect(client.get('/projects')).rejects.toThrow(FreeloApiError);
      await expect(client.get('/projects')).rejects.toMatchObject({
        status: 500,
        message: 'HTTP 500: Internal Server Error',
      });
    });

    it('should handle timeout error', async () => {
      fetchMock.mockImplementation(() => {
        const error = new Error('Aborted');
        error.name = 'AbortError';
        return Promise.reject(error);
      });

      const client = new HttpClient({ ...defaultConfig, timeout: 100 });

      try {
        await client.get('/projects');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(FreeloApiError);
        expect((error as FreeloApiError).status).toBe(408);
      }
    });

    it('should handle network error', async () => {
      fetchMock.mockRejectedValue(new Error('Network error'));

      const client = new HttpClient(defaultConfig);

      await expect(client.get('/projects')).rejects.toThrow(FreeloApiError);
      await expect(client.get('/projects')).rejects.toMatchObject({
        message: 'Network error',
        status: 0,
      });
    });
  });

  describe('FreeloApiError', () => {
    it('should have isRateLimited property', () => {
      const error = new FreeloApiError('Rate limited', 429);
      expect(error.isRateLimited).toBe(true);
    });

    it('should have isUnauthorized property', () => {
      const error = new FreeloApiError('Unauthorized', 401);
      expect(error.isUnauthorized).toBe(true);
    });

    it('should have isNotFound property', () => {
      const error = new FreeloApiError('Not found', 404);
      expect(error.isNotFound).toBe(true);
    });

    it('should have isClientError property', () => {
      const error400 = new FreeloApiError('Bad request', 400);
      const error404 = new FreeloApiError('Not found', 404);
      const error500 = new FreeloApiError('Server error', 500);

      expect(error400.isClientError).toBe(true);
      expect(error404.isClientError).toBe(true);
      expect(error500.isClientError).toBe(false);
    });

    it('should have isServerError property', () => {
      const error500 = new FreeloApiError('Server error', 500);
      const error503 = new FreeloApiError('Service unavailable', 503);
      const error400 = new FreeloApiError('Bad request', 400);

      expect(error500.isServerError).toBe(true);
      expect(error503.isServerError).toBe(true);
      expect(error400.isServerError).toBe(false);
    });
  });

  describe('requestWithRetry', () => {
    it('should retry on rate limit', async () => {
      let callCount = 0;
      fetchMock.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            ok: false,
            status: 429,
            statusText: 'Too Many Requests',
          });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve({ data: 'success' }),
        });
      });

      const client = new HttpClient(defaultConfig);
      const result = await client.requestWithRetry('/test', {}, { maxRetries: 1, retryDelay: 10 });

      expect(callCount).toBe(2);
      expect(result).toEqual({ data: 'success' });
    });

    it('should throw after max retries exceeded', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      });

      const client = new HttpClient(defaultConfig);

      await expect(
        client.requestWithRetry('/test', {}, { maxRetries: 1, retryDelay: 10 })
      ).rejects.toThrow(RateLimitError);
    });

    it('should not retry on non-rate-limit errors', async () => {
      let callCount = 0;
      fetchMock.mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: () => Promise.resolve({ message: 'Not found' }),
        });
      });

      const client = new HttpClient(defaultConfig);

      await expect(
        client.requestWithRetry('/test', {}, { maxRetries: 3, retryDelay: 10 })
      ).rejects.toThrow(FreeloApiError);

      expect(callCount).toBe(1);
    });
  });

  describe('uploadFile', () => {
    it('should upload file with FormData', async () => {
      const mockResponse = {
        uuid: 'file-uuid-123',
        download_url: 'https://api.freelo.io/file/download/file-uuid-123',
        filename: 'test.pdf',
      };

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockResponse),
      });

      const client = new HttpClient(defaultConfig);
      const blob = new Blob(['test content'], { type: 'application/pdf' });
      const result = await client.uploadFile('/file/upload', blob, 'test.pdf');

      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.freelo.io/v1/file/upload',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle upload error', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 413,
        statusText: 'Payload Too Large',
        json: () => Promise.resolve({ message: 'File too large' }),
      });

      const client = new HttpClient(defaultConfig);
      const blob = new Blob(['test content']);

      await expect(client.uploadFile('/file/upload', blob, 'test.pdf')).rejects.toThrow(
        FreeloApiError
      );
    });

    it('should handle rate limiting during upload', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      });

      const client = new HttpClient(defaultConfig);
      const blob = new Blob(['test content']);

      await expect(client.uploadFile('/file/upload', blob, 'test.pdf')).rejects.toThrow(
        RateLimitError
      );
    });
  });
});

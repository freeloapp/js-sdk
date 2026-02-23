import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createFreelo } from '../src/freelo';
import {
  getProjects,
  getAllProjects,
  createProject,
  getProject,
  deleteProject,
  createTask,
  getTask,
  getAllTasks,
  search,
} from '../src/generated/sdk.gen';

describe('SDK functions with mock fetch', () => {
  const mockFetch = vi.fn();
  const originalFetch = globalThis.fetch;
  let client: ReturnType<typeof createFreelo>;

  beforeEach(() => {
    globalThis.fetch = mockFetch;
    mockFetch.mockReset();

    client = createFreelo({
      email: 'test@example.com',
      apiKey: 'test-key',
      userAgent: 'SDKTest/1.0',
    });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  function mockJsonResponse(data: unknown, status = 200) {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  }

  describe('Projects', () => {
    it('getProjects sends GET /projects', async () => {
      const mockData = [
        { id: 1, name: 'Project A' },
        { id: 2, name: 'Project B' },
      ];
      mockJsonResponse(mockData);

      const result = await getProjects({ client });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const request = mockFetch.mock.calls[0][0] as Request;
      expect(request.method).toBe('GET');
      expect(request.url).toContain('/projects');
    });

    it('getAllProjects sends GET /all-projects', async () => {
      const mockData = {
        total: 50,
        count: 20,
        page: 0,
        per_page: 20,
        projects: [{ id: 1, name: 'Project A' }],
      };
      mockJsonResponse(mockData);

      const result = await getAllProjects({ client });

      const request = mockFetch.mock.calls[0][0] as Request;
      expect(request.method).toBe('GET');
      expect(request.url).toContain('/all-projects');
    });

    it('createProject sends POST /projects with body', async () => {
      const mockResponse = { id: 123, name: 'New Project' };
      mockJsonResponse(mockResponse);

      const result = await createProject({
        client,
        body: {
          name: 'New Project',
          currency: 'CZK',
        },
      });

      const request = mockFetch.mock.calls[0][0] as Request;
      expect(request.method).toBe('POST');
      expect(request.url).toContain('/projects');
      expect(request.headers.get('Content-Type')).toBe('application/json');
    });

    it('getProject sends GET /project/{project_id}', async () => {
      const mockData = { id: 42, name: 'My Project' };
      mockJsonResponse(mockData);

      await getProject({
        client,
        path: { project_id: 42 },
      });

      const request = mockFetch.mock.calls[0][0] as Request;
      expect(request.method).toBe('GET');
      expect(request.url).toContain('/project/42');
    });

    it('deleteProject sends DELETE /project/{project_id}', async () => {
      mockJsonResponse({ result: 'success' });

      await deleteProject({
        client,
        path: { project_id: 42 },
      });

      const request = mockFetch.mock.calls[0][0] as Request;
      expect(request.method).toBe('DELETE');
      expect(request.url).toContain('/project/42');
    });
  });

  describe('Tasks', () => {
    it('getAllTasks sends GET /all-tasks', async () => {
      mockJsonResponse({
        total: 10,
        count: 10,
        page: 0,
        per_page: 20,
        tasks: [],
      });

      await getAllTasks({ client });

      const request = mockFetch.mock.calls[0][0] as Request;
      expect(request.method).toBe('GET');
      expect(request.url).toContain('/all-tasks');
    });

    it('createTask sends POST /tasklist/{tasklist_id}/tasks', async () => {
      mockJsonResponse({ id: 99, name: 'New Task' });

      await createTask({
        client,
        path: { tasklist_id: 5 },
        body: {
          name: 'New Task',
          worker_ids: [1, 2],
        },
      });

      const request = mockFetch.mock.calls[0][0] as Request;
      expect(request.method).toBe('POST');
      expect(request.url).toContain('/tasklist/5/tasks');
    });

    it('getTask sends GET /task/{task_id}', async () => {
      mockJsonResponse({ id: 99, name: 'Test Task' });

      await getTask({
        client,
        path: { task_id: 99 },
      });

      const request = mockFetch.mock.calls[0][0] as Request;
      expect(request.method).toBe('GET');
      expect(request.url).toContain('/task/99');
    });
  });

  describe('Search', () => {
    it('search sends POST /search', async () => {
      mockJsonResponse({ results: [] });

      await search({
        client,
        body: {
          search: 'my query',
        },
      });

      const request = mockFetch.mock.calls[0][0] as Request;
      expect(request.method).toBe('POST');
      expect(request.url).toContain('/search');
    });
  });

  describe('Auth headers', () => {
    it('includes Basic Auth header on all requests', async () => {
      mockJsonResponse([]);

      await getProjects({ client });

      const request = mockFetch.mock.calls[0][0] as Request;
      const expected = btoa('test@example.com:test-key');
      expect(request.headers.get('Authorization')).toBe(`Basic ${expected}`);
    });

    it('per-request client overrides auth', async () => {
      mockJsonResponse([]);

      const otherClient = createFreelo({
        email: 'other@example.com',
        apiKey: 'other-key',
        userAgent: 'Test/1.0',
      });

      await getProjects({ client: otherClient });

      const request = mockFetch.mock.calls[0][0] as Request;
      const expected = btoa('other@example.com:other-key');
      expect(request.headers.get('Authorization')).toBe(`Basic ${expected}`);
    });
  });
});

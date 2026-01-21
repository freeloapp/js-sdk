import { describe, it, expect, beforeAll } from 'vitest';
import { Freelo } from '../../src/index.js';

/**
 * E2E Tests for Projects
 *
 * These tests run against the real Freelo API and require credentials.
 * To run these tests, set the following environment variables:
 *   - FREELO_EMAIL: Your Freelo account email
 *   - FREELO_API_KEY: Your API key from Freelo settings
 *
 * Run with: FREELO_EMAIL=your@email.com FREELO_API_KEY=your-key npm run test:run
 */

// Skip E2E tests if credentials are not available
const SKIP_E2E = !process.env.FREELO_EMAIL || !process.env.FREELO_API_KEY;

describe.skipIf(SKIP_E2E)('Projects E2E', () => {
  let freelo: Freelo;

  beforeAll(() => {
    freelo = new Freelo({
      email: process.env.FREELO_EMAIL!,
      apiKey: process.env.FREELO_API_KEY!,
      userAgent: 'FreeloSDK-Test/1.0 (test@example.com)',
    });
  });

  it('should list projects', async () => {
    const projects = await freelo.projects.list();

    expect(Array.isArray(projects)).toBe(true);
  });

  it('should list all projects with pagination', async () => {
    const response = await freelo.projects.listAll({ page: 1 });

    expect(response).toHaveProperty('total');
    expect(response).toHaveProperty('page');
    expect(response).toHaveProperty('data');
    expect(response.data).toHaveProperty('projects');
    expect(Array.isArray(response.data.projects)).toBe(true);
  });

  it('should get a single project when available', async () => {
    const projects = await freelo.projects.list();

    if (projects.length > 0) {
      const project = await freelo.projects.get(projects[0].id);

      expect(project).toHaveProperty('id');
      expect(project).toHaveProperty('name');
      expect(project).toHaveProperty('tasklists');
    }
  });

  it('should list project labels', async () => {
    const labels = await freelo.projects.getLabels();

    expect(Array.isArray(labels)).toBe(true);
  });
});

describe.skipIf(SKIP_E2E)('Tasks E2E', () => {
  let freelo: Freelo;

  beforeAll(() => {
    freelo = new Freelo({
      email: process.env.FREELO_EMAIL!,
      apiKey: process.env.FREELO_API_KEY!,
      userAgent: 'FreeloSDK-Test/1.0 (test@example.com)',
    });
  });

  it('should list all tasks', async () => {
    const response = await freelo.tasks.list();

    expect(response).toHaveProperty('total');
    expect(response).toHaveProperty('page');
    expect(response).toHaveProperty('data');
    expect(response.data).toHaveProperty('tasks');
    expect(Array.isArray(response.data.tasks)).toBe(true);
  });

  it('should get task labels', async () => {
    const labels = await freelo.tasks.getLabels();

    expect(Array.isArray(labels)).toBe(true);
  });
});

describe.skipIf(SKIP_E2E)('Users E2E', () => {
  let freelo: Freelo;

  beforeAll(() => {
    freelo = new Freelo({
      email: process.env.FREELO_EMAIL!,
      apiKey: process.env.FREELO_API_KEY!,
      userAgent: 'FreeloSDK-Test/1.0 (test@example.com)',
    });
  });

  it('should list users', async () => {
    const response = await freelo.users.list();

    expect(response).toHaveProperty('data');
    expect(response.data).toHaveProperty('users');
    expect(Array.isArray(response.data.users)).toBe(true);
  });
});

describe.skipIf(SKIP_E2E)('States E2E', () => {
  let freelo: Freelo;

  beforeAll(() => {
    freelo = new Freelo({
      email: process.env.FREELO_EMAIL!,
      apiKey: process.env.FREELO_API_KEY!,
      userAgent: 'FreeloSDK-Test/1.0 (test@example.com)',
    });
  });

  it('should list all states', async () => {
    const states = await freelo.states.list();

    expect(Array.isArray(states)).toBe(true);
    if (states.length > 0) {
      expect(states[0]).toHaveProperty('id');
      expect(states[0]).toHaveProperty('state');
    }
  });
});

describe.skipIf(SKIP_E2E)('Search E2E', () => {
  let freelo: Freelo;

  beforeAll(() => {
    freelo = new Freelo({
      email: process.env.FREELO_EMAIL!,
      apiKey: process.env.FREELO_API_KEY!,
      userAgent: 'FreeloSDK-Test/1.0 (test@example.com)',
    });
  });

  it('should perform search', async () => {
    const response = await freelo.search.search({
      search_query: 'test',
    });

    expect(response).toHaveProperty('data');
    expect(response.data).toHaveProperty('results');
    expect(Array.isArray(response.data.results)).toBe(true);
  });
});

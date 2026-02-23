# Freelo SDK

Official JavaScript/TypeScript SDK for [Freelo.io](https://app.freelo.io) API.

[![npm version](https://badge.fury.io/js/@freeloapp/js-sdk.svg)](https://badge.fury.io/js/@freeloapp/js-sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Auto-generated from OpenAPI** — always in sync with the Freelo API
- Full TypeScript support with type definitions
- Zero runtime dependencies (uses native fetch)
- **Tree-shakeable** — import only what you need
- Works in Node.js 18+, browsers, and all major frameworks
- Promise-based async/await API
- Per-request auth for multi-tenant scenarios
- Built-in pagination, currency, and date utilities

## Installation

```bash
npm install @freeloapp/js-sdk
```

## Quick Start

```typescript
import { createFreelo, getProjects, createTask } from '@freeloapp/js-sdk';

// Initialize client (sets global default)
createFreelo({
  auth: { type: 'basic', email: 'your@email.tld', apiKey: 'your-api-key' },
  userAgent: 'YourApp/1.0 (contact@yourapp.com)',
});

// Get all projects
const { data: projects } = await getProjects();

// Create a task
const { data: task } = await createTask({
  path: { tasklist_id: 123 },
  body: {
    name: 'New Task',
    worker_ids: [userId],
  },
});
```

## Authentication

Get your API key from [Freelo Settings](https://app.freelo.io/profil/nastaveni).

The SDK uses HTTP Basic Auth with your email as the username and API key as the password.

## Configuration

```typescript
import { createFreelo } from '@freeloapp/js-sdk';

const client = createFreelo({
  auth: {                        // Required: authentication credentials
    type: 'basic',               //   Basic Auth with email + API key
    email: 'your@email.tld',
    apiKey: 'your-api-key',
  },
  userAgent: 'YourApp/1.0',      // Required: Identifies your application
  baseUrl: 'https://api.freelo.io/v1',  // Optional: API base URL
  logging: true,                 // Optional: Log requests to console
});
```

## Multi-Tenant / Per-Request Auth

Create multiple client instances for different users:

```typescript
import { createFreelo, getProjects } from '@freeloapp/js-sdk';

// Default client
const defaultClient = createFreelo({
  auth: { type: 'basic', email: 'admin@company.com', apiKey: 'admin-key' },
  userAgent: 'MyApp/1.0',
});

// Per-user client
const userClient = createFreelo({
  auth: { type: 'basic', email: user.email, apiKey: user.apiKey },
  userAgent: 'MyApp/1.0',
});

// Bearer token auth (JWT, PASETO, etc.)
const tokenClient = createFreelo({
  auth: { type: 'bearer', token: 'your-jwt-token' },
  userAgent: 'MyApp/1.0',
});

// Use default client
const { data: adminProjects } = await getProjects();

// Use per-user client
const { data: userProjects } = await getProjects({ client: userClient });

// Use token-based client
const { data: tokenProjects } = await getProjects({ client: tokenClient });
```

## API Reference

All SDK functions are auto-generated from the [Freelo OpenAPI spec](https://api.freelo.io/docs/v1/freelo-api.yaml). Each function maps directly to an API endpoint.

### Projects

```typescript
import {
  getProjects,
  getAllProjects,
  getProject,
  createProject,
  deleteProject,
  archiveProject,
  activateProject,
  getProjectWorkers,
} from '@freeloapp/js-sdk';

// List own active projects
const { data: projects } = await getProjects();

// List all projects (paginated)
const { data } = await getAllProjects({ query: { p: 0 } });

// Get project by ID
const { data: project } = await getProject({ path: { project_id: 42 } });

// Create project
const { data: newProject } = await createProject({
  body: { name: 'New Project', currency: 'CZK' },
});

// Delete / archive / activate
await deleteProject({ path: { project_id: 42 } });
await archiveProject({ path: { project_id: 42 } });
await activateProject({ path: { project_id: 42 } });
```

### Tasks

```typescript
import {
  getAllTasks,
  getTask,
  createTask,
  editTask,
  finishTask,
  deleteTask,
  moveTask,
} from '@freeloapp/js-sdk';

// List all tasks (paginated)
const { data } = await getAllTasks({ query: { p: 0 } });

// Get task by ID
const { data: task } = await getTask({ path: { task_id: 99 } });

// Create task in a tasklist
const { data: newTask } = await createTask({
  path: { tasklist_id: 5 },
  body: { name: 'New Task', worker_ids: [1] },
});

// Edit task
await editTask({
  path: { task_id: 99 },
  body: { name: 'Updated Name' },
});

// Finish / delete / move
await finishTask({ path: { task_id: 99 } });
await deleteTask({ path: { task_id: 99 } });
await moveTask({
  path: { task_id: 99 },
  body: { tasklist_id: 10 },
});
```

### Tasklists

```typescript
import {
  getAllTasklists,
  getTasklist,
  createTasklist,
} from '@freeloapp/js-sdk';

const { data } = await getAllTasklists();
const { data: tasklist } = await getTasklist({ path: { tasklist_id: 5 } });
const { data: newTasklist } = await createTasklist({
  path: { project_id: 42 },
  body: { name: 'New Tasklist' },
});
```

### Comments

```typescript
import { getAllComments, createComment, editComment } from '@freeloapp/js-sdk';

const { data } = await getAllComments({ path: { task_id: 99 } });
const { data: comment } = await createComment({
  path: { task_id: 99 },
  body: { content: 'Hello!' },
});
```

### Time Tracking

```typescript
import { startTimeTracking, stopTimeTracking, editTimeTracking } from '@freeloapp/js-sdk';

await startTimeTracking({
  path: { task_id: 99 },
  body: { note: 'Working on feature' },
});

await stopTimeTracking({ path: { task_id: 99 } });
```

### Search

```typescript
import { search } from '@freeloapp/js-sdk';

const { data: results } = await search({
  body: { search: 'bug fix' },
});
```

## Pagination

The SDK provides utilities for handling paginated responses:

```typescript
import { fetchAllPages, iteratePages, createPaginator, getAllProjects } from '@freeloapp/js-sdk';

// Iterate through all items one by one
for await (const project of iteratePages(
  (page) => getAllProjects({ query: { p: page } }),
  (response) => response.data ?? []
)) {
  console.log(project.name);
}

// Fetch all pages at once
const allProjects = await fetchAllPages(
  (page) => getAllProjects({ query: { p: page } }),
  (response) => response.data ?? []
);

// Create a reusable paginator
const paginator = createPaginator(
  (page) => getAllProjects({ query: { p: page } }),
  (response) => response.data ?? []
);
const all = await paginator.fetchAll();
```

## Error Handling

```typescript
import { getProject, isFreeloError, isRateLimited, isUnauthorized, isNotFound } from '@freeloapp/js-sdk';

const { data, error } = await getProject({ path: { project_id: 123 } });

if (error) {
  if (isRateLimited(error)) {
    console.log('Rate limited, try again in 60 seconds');
  } else if (isUnauthorized(error)) {
    console.log('Invalid credentials');
  } else if (isNotFound(error)) {
    console.log('Project not found');
  } else if (isFreeloError(error)) {
    console.log('API error:', error.message);
  }
} else {
  console.log('Project:', data);
}
```

## Rate Limiting

The API allows 25 requests per minute. When exceeded, you'll receive a 429 status code. The SDK logs a warning automatically. Wait 60 seconds before retrying.

## Utility Functions

### Date Utilities

```typescript
import { dateToApi, dateFromApi, today, daysFromNow } from '@freeloapp/js-sdk';

dateToApi(new Date());       // "2024-01-15"
dateFromApi('2024-01-15');   // Date object
today();                     // Today in API format
daysFromNow(7);              // 7 days from now
```

### Currency Utilities

```typescript
import { currencyToApi, currencyFromApi, formatCurrency } from '@freeloapp/js-sdk';

currencyToApi(123.45);              // "12345"
currencyFromApi("12345");           // 123.45
formatCurrency(123.45, 'CZK');     // "123,45 Kc"
```

## Updating SDK When API Changes

The SDK is generated from the online OpenAPI spec at `https://api.freelo.io/docs/v1/freelo-api.yaml`.

```bash
npm run generate          # Re-generate from latest spec
npm run generate:check    # Verify generated code matches committed version
```

CI pipeline checks weekly for spec changes.

## TypeScript Support

All types are auto-generated and fully typed:

```typescript
import type { ProjectFull, TaskFull, UserBasic, TaskCreate } from '@freeloapp/js-sdk';
```

## Migration from v1

v2 replaces the class-based API with tree-shakeable functions:

```typescript
// v1 (class-based)
import { Freelo } from '@freeloapp/js-sdk';
const freelo = new Freelo({ email, apiKey, userAgent });
const projects = await freelo.projects.list();

// v2 (function-based, tree-shakeable)
import { createFreelo, getProjects } from '@freeloapp/js-sdk';
createFreelo({ auth: { type: 'basic', email, apiKey }, userAgent });
const { data: projects } = await getProjects();
```

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a pull request.

## License

MIT

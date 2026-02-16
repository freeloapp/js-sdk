# Freelo SDK

Official JavaScript/TypeScript SDK for [Freelo.io](https://app.freelo.io) API.

[![npm version](https://badge.fury.io/js/@freeloapp/js-sdk.svg)](https://badge.fury.io/js/@freeloapp/js-sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- Full TypeScript support with type definitions
- Zero runtime dependencies (uses native fetch)
- Works in Node.js 18+, browsers, and all major frameworks
- Promise-based async/await API
- Dynamic credentials (switch users or set credentials lazily)
- Comprehensive error handling
- Tree-shakeable ES modules
- Built-in pagination utilities

## Installation

```bash
npm install @freeloapp/js-sdk
# or
yarn add @freeloapp/js-sdk
# or
pnpm add @freeloapp/js-sdk
```

## Quick Start

```typescript
import { Freelo } from '@freeloapp/js-sdk';

const freelo = new Freelo({
  email: 'your@email.tld',
  apiKey: 'your-api-key',
  userAgent: 'YourApp/1.0 (contact@yourapp.com)',
});

// Get all projects
const projects = await freelo.projects.list();

// Create a task
const task = await freelo.tasks.create(tasklistId, {
  name: 'New Task',
  due_date: '2024-12-31',
  worker_ids: [userId],
});
```

## Authentication

Get your API key from [Freelo Settings](https://app.freelo.io/profil/nastaveni).

The SDK uses HTTP Basic Auth with your email as the username and API key as the password.

## Configuration

```typescript
const freelo = new Freelo({
  email: 'your@email.tld',       // Required: Your Freelo account email
  apiKey: 'your-api-key',        // Required: API key from Freelo settings
  userAgent: 'YourApp/1.0',      // Required: Identifies your application
  baseUrl: 'https://api.freelo.io/v1',  // Optional: API base URL
  timeout: 30000,                // Optional: Request timeout in ms
});
```

## Dynamic Credentials

The SDK supports changing credentials at runtime. This is useful for multi-user systems that make requests on behalf of different users.

### Per-request credentials (server-safe)

Use `withCredentials()` to create a new isolated instance. This is safe for concurrent server requests since each instance has its own credentials:

```typescript
const freelo = new Freelo({
  email: 'default@email.tld',
  apiKey: 'default-key',
  userAgent: 'MyApp/1.0',
});

// Each request handler gets its own instance
app.get('/projects', async (req, res) => {
  const userFreelo = freelo.withCredentials({
    email: req.user.email,
    apiKey: req.user.apiKey,
  });
  const projects = await userFreelo.projects.list();
  res.json(projects);
});
```

### Lazy initialization

Create the client without credentials and derive per-user instances later:

```typescript
const freelo = new Freelo({ userAgent: 'MyApp/1.0' });

// ... later, when a user authenticates:
const userFreelo = freelo.withCredentials({
  email: 'user@email.tld',
  apiKey: 'user-api-key',
});

const projects = await userFreelo.projects.list();
```

### Low-level API calls

Use `call()` to hit any endpoint not covered by the resource namespaces:

```typescript
// POST with JSON body
const result = await freelo.call('/jobs/create', 'POST', { name: 'My Job' });

// GET with query parameters
const jobs = await freelo.call('/jobs', 'GET', undefined, { page: 2, limit: 10 });

// DELETE
await freelo.call('/jobs/123', 'DELETE');
```

Parameters:
- **`path`** — endpoint path without the base URL (e.g., `/jobs/create`)
- **`method`** — `GET`, `POST`, `PUT`, or `DELETE`
- **`data`** — optional JSON request body (plain object, no validation)
- **`params`** — optional query parameters as `{ key: value }`

## API Reference

### Projects

```typescript
// List all projects
const projects = await freelo.projects.list();
const projects = await freelo.projects.list({ page: 2, limit: 50 });

// Get project by ID
const project = await freelo.projects.get(projectId);

// Create project
const project = await freelo.projects.create({
  name: 'New Project',
  currency: 'CZK',
});

// Create project from template
const project = await freelo.projects.createFromTemplate(templateId, {
  name: 'From Template',
});

// Delete/archive/activate project
await freelo.projects.delete(projectId);
await freelo.projects.archive(projectId);
await freelo.projects.activate(projectId);

// Workers
const workers = await freelo.projects.listWorkers(projectId);
await freelo.projects.addWorkers(projectId, { user_ids: [userId] });
await freelo.projects.removeWorkers(projectId, { user_ids: [userId] });
```

### Tasklists

```typescript
// List tasklists in a project
const tasklists = await freelo.tasklists.list(projectId);

// Get tasklist by ID
const tasklist = await freelo.tasklists.get(tasklistId);

// Create tasklist
const tasklist = await freelo.tasklists.create(projectId, {
  name: 'New Tasklist',
});

// Create from template
const tasklist = await freelo.tasklists.createFromTemplate(templateId, projectId, {
  name: 'From Template',
});

// Update/delete/move
await freelo.tasklists.update(tasklistId, { name: 'Updated Name' });
await freelo.tasklists.delete(tasklistId);
await freelo.tasklists.move(tasklistId, { project_id: newProjectId, position: 0 });
```

### Tasks

```typescript
// List tasks in a tasklist
const tasks = await freelo.tasks.list(tasklistId);
const finishedTasks = await freelo.tasks.listFinished(tasklistId);

// Get task by ID
const task = await freelo.tasks.get(taskId);

// Create task
const task = await freelo.tasks.create(tasklistId, {
  name: 'New Task',
  due_date: '2024-12-31',
  worker_ids: [userId],
});

// Create from template
const task = await freelo.tasks.createFromTemplate(templateId, tasklistId, {
  name: 'From Template',
});

// Update task
await freelo.tasks.update(taskId, { name: 'Updated Task' });

// Finish/activate/delete
await freelo.tasks.finish(taskId);
await freelo.tasks.activate(taskId);
await freelo.tasks.delete(taskId);

// Task description
const description = await freelo.tasks.getDescription(taskId);
await freelo.tasks.updateDescription(taskId, { description: 'New description' });

// Task labels
await freelo.tasks.addLabels(taskId, { labels: [labelId] });
await freelo.tasks.removeLabels(taskId, { labels: [labelId] });

// Time estimates
await freelo.tasks.setTotalTimeEstimate(taskId, { total_time_estimate: 3600 });
const estimates = await freelo.tasks.getUserTimeEstimates(taskId);
await freelo.tasks.setUserTimeEstimate(taskId, userId, { time_estimate: 3600 });

// Reminders
await freelo.tasks.setReminder(taskId, { reminder_datetime: '2024-12-31T09:00:00' });
await freelo.tasks.deleteReminder(taskId);
```

### Subtasks

```typescript
// List subtasks
const subtasks = await freelo.subtasks.list(taskId);

// Get/create/update/delete
const subtask = await freelo.subtasks.get(subtaskId);
const subtask = await freelo.subtasks.create(taskId, { name: 'Subtask' });
await freelo.subtasks.update(subtaskId, { name: 'Updated' });
await freelo.subtasks.delete(subtaskId);

// Finish/activate
await freelo.subtasks.finish(subtaskId);
await freelo.subtasks.activate(subtaskId);
```

### Comments

```typescript
// List comments on a task
const comments = await freelo.comments.list(taskId);

// Get/create/update/delete
const comment = await freelo.comments.get(commentId);
const comment = await freelo.comments.create(taskId, { content: 'New comment' });
await freelo.comments.update(commentId, { content: 'Updated' });
await freelo.comments.delete(commentId);
```

### Time Tracking

```typescript
// Start tracking
await freelo.timeTracking.start({
  task_id: taskId,
  note: 'Working on feature',
});

// Stop tracking
await freelo.timeTracking.stop();

// Get running tracker
const tracker = await freelo.timeTracking.getRunning();

// Edit tracked time
await freelo.timeTracking.edit({
  date_report: '2024-01-15',
  time_from: '09:00',
  time_to: '17:00',
  task_id: taskId,
});
```

### Work Reports

```typescript
// List work reports
const reports = await freelo.workReports.list({ date_from: '2024-01-01' });

// Get/create/update/delete
const report = await freelo.workReports.get(reportId);
const report = await freelo.workReports.create(taskId, {
  date_report: '2024-01-15',
  time_from: '09:00',
  time_to: '12:00',
});
await freelo.workReports.update(reportId, { note: 'Updated note' });
await freelo.workReports.delete(reportId);
```

### Users

```typescript
// List all users
const users = await freelo.users.list();

// Get current user
const me = await freelo.users.me();

// Get user by ID
const user = await freelo.users.get(userId);

// Invite users
const result = await freelo.users.invite({
  users: [{ email: 'new@user.com', firstname: 'John', lastname: 'Doe' }],
});

// Manage workers in project
await freelo.users.manageWorkers(projectId, {
  user_ids: [userId],
  tasklist_ids: [tasklistId],
});

// Out of office
const status = await freelo.users.getOutOfOffice(userId);
await freelo.users.setOutOfOffice(userId, {
  out_of_office: {
    enabled: true,
    date_to: '2024-12-31',
  },
});
```

### Files

```typescript
// List files in a project
const files = await freelo.files.listForProject(projectId);

// Upload file (from buffer or blob)
const file = await freelo.files.upload(fileBuffer, 'document.pdf');

// Get file
const file = await freelo.files.get(fileId);

// Download file (returns blob)
const blob = await freelo.files.download(fileId);

// Delete file
await freelo.files.delete(fileId);
```

### Search

```typescript
// Search for items
const results = await freelo.search.search({
  search_query: 'bug fix',
});

// With filters
const results = await freelo.search.search({
  search_query: 'feature',
  types: ['task', 'comment'],
  project_ids: [projectId],
  state_ids: [1, 2], // Active, Finished
});
```

### Notifications

```typescript
// List notifications
const notifications = await freelo.notifications.list();
const unread = await freelo.notifications.list({ only_unread: true });

// Get unread count
const count = await freelo.notifications.getUnreadCount();

// Mark as read
await freelo.notifications.markAsRead(notificationId);
await freelo.notifications.markAllAsRead();
```

### Events

```typescript
// List events
const events = await freelo.events.list({
  date_from: '2024-01-01',
  date_to: '2024-01-31',
});

// With filters
const events = await freelo.events.list({
  project_ids: [projectId],
  user_ids: [userId],
  types: ['task-created', 'comment-added'],
});
```

### Custom Fields

```typescript
// Get available field types
const types = await freelo.customFields.getTypes();

// List fields for a project
const fields = await freelo.customFields.listForProject(projectId);

// Create custom field
const field = await freelo.customFields.create(projectId, {
  name: 'Priority',
  type: 'enum',
});

// Set field value on task
await freelo.customFields.setValue(taskId, {
  custom_field_uuid: fieldId,
  value: 'High',
});

// Enum options
await freelo.customFields.addEnumOption(fieldId, { name: 'Low' });
await freelo.customFields.renameEnumOption(optionId, { name: 'Very Low' });
```

### Notes

```typescript
// List notes in a project
const notes = await freelo.notes.list(projectId);

// Get/create/update/delete
const note = await freelo.notes.get(noteId);
const note = await freelo.notes.create(projectId, {
  name: 'Meeting Notes',
  content: 'Discussion points...',
});
await freelo.notes.update(noteId, { content: 'Updated content' });
await freelo.notes.delete(noteId);
```

### Invoicing

```typescript
// List invoices
const invoices = await freelo.invoicing.list({ date_from: '2024-01-01' });

// Get invoice
const invoice = await freelo.invoicing.get(invoiceId);

// Mark as invoiced
await freelo.invoicing.markAsInvoiced(invoiceId, {
  invoice_number: 'INV-2024-001',
});

// Remove invoiced status
await freelo.invoicing.unmarkAsInvoiced(invoiceId);
```

### States

```typescript
// Get all task states
const states = await freelo.states.list();
// Returns: [{ id: 1, name: 'Active' }, { id: 2, name: 'Finished' }, ...]
```

## Pagination

The SDK provides utilities for handling paginated responses:

```typescript
import { fetchAllPages, iteratePages, createPaginator } from '@freeloapp/js-sdk';

// Fetch all pages at once
const allProjects = await fetchAllPages(
  (page) => freelo.projects.list({ page }),
  (response) => response.data.projects
);

// Iterate through pages one by one
for await (const projects of iteratePages(
  (page) => freelo.projects.list({ page }),
  (response) => response.data.projects
)) {
  console.log('Got page with', projects.length, 'projects');
}

// Create a reusable paginator
const paginator = createPaginator(
  (page) => freelo.projects.list({ page }),
  (response) => response.data.projects
);

// Use the paginator
const page1 = await paginator.fetchPage(1);
const allItems = await paginator.fetchAll();
for await (const items of paginator.iterate()) { /* ... */ }
```

## Error Handling

```typescript
import { Freelo, FreeloApiError, RateLimitError } from '@freeloapp/js-sdk';

try {
  await freelo.projects.get(123);
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log('Rate limited, try again in 60 seconds');
  } else if (error instanceof FreeloApiError) {
    if (error.isNotFound) {
      console.log('Project not found');
    } else if (error.isUnauthorized) {
      console.log('Invalid credentials');
    } else if (error.isClientError) {
      console.log('Client error:', error.message);
      console.log('Validation errors:', error.errors);
    } else if (error.isServerError) {
      console.log('Server error:', error.status);
    }
  }
}
```

## Rate Limiting

The API allows 25 requests per minute. When exceeded, you'll receive a 429 status code and the SDK will throw a `RateLimitError`. Wait 60 seconds before retrying.

## Utility Functions

### Date Utilities

```typescript
import { dateToApi, dateFromApi, today, daysFromNow } from '@freeloapp/js-sdk';

// Convert to API format (YYYY-MM-DD)
const apiDate = dateToApi(new Date());  // "2024-01-15"

// Parse from API format
const date = dateFromApi('2024-01-15');  // Date object

// Convenience functions
const todayStr = today();                // Today in API format
const nextWeek = daysFromNow(7);         // 7 days from now
```

### Currency Utilities

```typescript
import { currencyToApi, currencyFromApi, formatCurrency } from '@freeloapp/js-sdk';

// Convert decimal to API format (cents)
const cents = currencyToApi(123.45);      // 12345

// Convert from API format
const decimal = currencyFromApi(12345);    // 123.45

// Format for display
const formatted = formatCurrency(12345, 'CZK');  // "123.45 CZK"
```

## Examples

See the [examples](./examples) directory for complete examples:

- **[Basic Usage](./examples/basic)** - Getting started, creating tasks, time tracking
- **[React Integration](./examples/react)** - Hooks and components for React apps
- **[Vue Integration](./examples/vue)** - Composables and components for Vue apps
- **[Next.js API Routes](./examples/nextjs)** - Server-side usage with Next.js
- **[Node.js Scripts](./examples/node)** - CLI tools and automation scripts
- **[Advanced Patterns](./examples/advanced)** - Error handling, pagination, bulk operations

## TypeScript Support

The SDK is written in TypeScript and provides comprehensive type definitions:

```typescript
import type {
  Project,
  Task,
  User,
  Comment,
  WorkReport,
  FreeloConfig,
  FreeloLazyConfig,
  FreeloCredentials,
} from '@freeloapp/js-sdk';

// All API responses are fully typed
const projects: Project[] = (await freelo.projects.list()).data.projects;

// Request bodies are typed
const createData: TaskCreate = {
  name: 'New Task',
  due_date: '2024-12-31',
};
```

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a pull request.

## License

MIT

# Freelo JS SDK

## Project Overview

This is the official JavaScript/TypeScript SDK for [Freelo.io](https://app.freelo.io) - a Project Management Tool. The SDK enables developers to easily integrate Freelo API into any JS/TS project (Node.js, React, Vue, Angular, etc.).

## Key Files

- **OpenAPI Specification**: `.openapi/freelo-api-openapi.yaml` - Complete API definition
- **Source Code**: `src/` - SDK source files
- **Tests**: `test/` - Test files
- **Examples**: `examples/` - Usage examples for different frameworks
- **Phase Documentation**: `docs/phases/` - Implementation phases

## API Information

- **Base URL**: `https://api.freelo.io/v1`
- **Authentication**: HTTP Basic Auth (email as username, API key as password)
- **Rate Limiting**: 25 requests per minute (429 status when exceeded, wait 60s)
- **Response Format**: JSON (UTF-8)
- **API Documentation**: https://freelo.docs.apiary.io/

## API Resources

The API provides these main resources:
- Projects (CRUD, archive, activate, workers)
- Tasklists (CRUD, move, budgets)
- Tasks (CRUD, labels, comments, time estimates)
- Subtasks
- Comments (with file attachments)
- Time Tracking (start, stop, edit)
- Work Reports
- Users (manage workers, out-of-office)
- Invoicing
- Custom Fields
- Notes
- Search
- Notifications
- Events
- Files

## SDK Design Goals

1. **Lightweight**: Minimal dependencies (use native fetch)
2. **TypeScript**: Full type definitions
3. **Easy to use**: Simple initialization, self-explanatory methods
4. **Universal**: Works in Node.js, browsers, and all major frameworks
5. **Modern**: Promise-based async/await API
6. **Tree-shakeable**: ES modules for optimal bundling

## Usage Pattern

```typescript
import { Freelo } from '@freelo/js-sdk';

const freelo = new Freelo({
  email: 'your@email.tld',
  apiKey: 'your-api-key',
  userAgent: 'YourApp/1.0 (contact@yourapp.com)'
});

// Get all projects
const projects = await freelo.projects.list();

// Create a task
const task = await freelo.tasks.create(tasklistId, {
  name: 'New Task',
  worker_ids: [userId]
});
```

## Development Commands

```bash
npm install      # Install dependencies
npm run build    # Build the SDK
npm run test     # Run tests
npm run lint     # Lint code
npm run typecheck # Check TypeScript types
```

## Coding Conventions

- Use TypeScript strict mode
- Use native fetch API (no external HTTP libraries)
- Keep bundle size minimal
- Export both ESM and CommonJS
- Provide comprehensive JSDoc comments
- Follow semantic versioning

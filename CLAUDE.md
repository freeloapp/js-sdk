# Freelo JS SDK

## Project Overview

This is the official JavaScript/TypeScript SDK for [Freelo.io](https://app.freelo.io) - a Project Management Tool. The SDK is auto-generated from the OpenAPI spec using [Hey API](https://heyapi.dev/), providing tree-shakeable functions for all API endpoints.

## Key Files

- **OpenAPI Specification**: https://api.freelo.io/docs/v1/freelo-api.yaml - Complete API definition (online)
- **Generator Config**: `openapi-ts.config.ts` - Hey API configuration
- **Source Code**: `src/` - SDK source files
  - `src/generated/` - Auto-generated code (do not edit manually)
  - `src/freelo.ts` - `createFreelo()` configuration function
  - `src/errors.ts` - Error utility functions
  - `src/utils/` - Pagination, currency, date helpers
- **Tests**: `test/` - Test files
- **Examples**: `examples/` - Usage examples for different frameworks

## API Information

- **Base URL**: `https://api.freelo.io/v1`
- **Authentication**: HTTP Basic Auth (email as username, API key as password)
- **Rate Limiting**: 25 requests per minute (429 status when exceeded, wait 60s)
- **Response Format**: JSON (UTF-8)
- **API Documentation**: https://freelo.docs.apiary.io/

## Usage Pattern

```typescript
import { createFreelo, getProjects, createTask } from '@freeloapp/js-sdk';

// Initialize client (sets global default)
createFreelo({
  email: 'your@email.tld',
  apiKey: 'your-api-key',
  userAgent: 'YourApp/1.0 (contact@yourapp.com)',
});

// Get all projects
const { data: projects } = await getProjects();

// Create a task
const { data: task } = await createTask({
  path: { tasklist_id: 123 },
  body: { name: 'New Task', worker_ids: [userId] },
});
```

## Development Commands

```bash
npm install        # Install dependencies
npm run generate   # Re-generate SDK from OpenAPI spec
npm run build      # Build the SDK
npm run test       # Run tests
npm run test:run   # Run tests once (CI)
npm run lint       # Lint code
npm run typecheck  # Check TypeScript types
```

## Coding Conventions

- Use TypeScript strict mode
- Generated code in `src/generated/` must NOT be edited manually
- Use native fetch API (no external HTTP libraries)
- Keep bundle size minimal
- Export both ESM and CommonJS
- All exports must be tree-shakeable (individual named functions, no namespace objects)
- Follow semantic versioning

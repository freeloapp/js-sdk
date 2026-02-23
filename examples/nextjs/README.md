# Next.js Example

Example Next.js application with API routes using the Freelo SDK.

## Prerequisites

- Node.js 18+
- Freelo account with API key

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file:
   ```bash
   FREELO_EMAIL=your@email.tld
   FREELO_API_KEY=your-api-key
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
app/
└── api/
    ├── projects/
    │   ├── route.ts          # GET /api/projects, POST /api/projects
    │   └── [id]/
    │       └── route.ts      # GET /api/projects/[id], DELETE /api/projects/[id]
    └── tasks/
        └── route.ts          # GET /api/tasks, POST /api/tasks
lib/
└── freelo.ts                 # Shared client initialization
```

## API Endpoints

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create a new project |
| GET | `/api/projects/[id]` | Get project details |
| DELETE | `/api/projects/[id]` | Delete a project |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List all tasks (supports `?page=N`) |
| POST | `/api/tasks` | Create a new task |

## Example Requests

### List Projects
```bash
curl http://localhost:3000/api/projects
```

### Create Project
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "My New Project"}'
```

### Create Task
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"tasklist_id": 12345, "name": "New Task", "due_date": "2024-12-31"}'
```

## What It Demonstrates

- Server-side SDK usage with `createFreelo()` (API keys never exposed to client)
- Tree-shakeable function imports (`getProjects`, `createTask`, etc.)
- Error handling with `isFreeloError()`, `isNotFound()` utility functions
- RESTful API design with Next.js App Router
- `{ data, error }` response pattern
- Shared client initialization pattern

## Using from Client Components

```tsx
'use client';

import { useEffect, useState } from 'react';

export function ProjectList() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(setProjects);
  }, []);

  return (
    <ul>
      {projects.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
  );
}
```

## Notes

- API keys are kept server-side only (in environment variables)
- All Freelo API calls go through your Next.js API routes
- This pattern is secure for production use

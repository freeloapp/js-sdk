# Node.js Examples

Command-line scripts demonstrating the Freelo SDK in Node.js.

## Prerequisites

- Node.js 18+
- Freelo account with API key

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables:
   ```bash
   export FREELO_EMAIL="your@email.tld"
   export FREELO_API_KEY="your-api-key"
   ```

## Scripts

### Sync Projects

Fetches and displays all projects with their details.

```bash
npm run sync
# or
npx tsx sync-projects.ts
```

**Output:**
```
Fetching all projects...

Found 5 project(s)

Project: Website Redesign (ID: 12345)
  State: In Progress
  Workers: 3
  Tasklists: 4
  Tasks: 15

...

Sync completed successfully!
```

### Export Tasks

Exports all tasks to a JSON file with pagination handling.

```bash
npm run export
# or with custom output file
npx tsx export-tasks.ts my-tasks.json
```

**Output:**
```
Exporting all tasks...

Fetched page 1 (20 tasks so far)
Fetched page 2 (40 tasks so far)
Fetched page 3 (55 tasks so far)

Exported 55 tasks to tasks-export.json
```

### Create Project with Tasks

Creates a project from a template configuration with tasklists, tasks, and subtasks.

```bash
npm run create
# or
npx tsx create-project-with-tasks.ts
```

**Output:**
```
Creating project: New Website Project

Created project: New Website Project (ID: 12345)
  Created tasklist: Design
    Created task: Create wireframes
    Created task: Design mockups
    Created task: Get design approval
  Created tasklist: Development
    Created task: Set up development environment
    ...

Project setup complete!
View at: https://app.freelo.io/project/12345
```

## What It Demonstrates

- **sync-projects.ts**: Pagination with `getAllProjects()`, project details with `getProject()`, error handling with `isFreeloError()` and `isRateLimited()`
- **export-tasks.ts**: Iterating through paginated results with `getAllTasks()`, file I/O, rate limit handling
- **create-project-with-tasks.ts**: Creating resources with `createProject()`, `createTasklist()`, `createTask()`, nested creation patterns

## Customization

You can modify the project template in `create-project-with-tasks.ts` to match your workflow:

```typescript
const projectTemplate = {
  name: 'My Custom Project',
  tasklists: [
    {
      name: 'Phase 1',
      tasks: [
        { name: 'Task 1', subtasks: ['Subtask A', 'Subtask B'] },
        { name: 'Task 2' },
      ],
    },
  ],
};
```

## Notes

- These scripts respect API rate limits (25 requests/minute)
- Use small delays between requests when processing large amounts of data
- The SDK handles authentication automatically via Basic Auth

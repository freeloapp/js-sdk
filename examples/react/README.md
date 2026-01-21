# React Example

Example React application using the Freelo SDK.

## Prerequisites

- Node.js 18+
- Freelo account with API key

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file:
   ```bash
   VITE_FREELO_EMAIL=your@email.tld
   VITE_FREELO_API_KEY=your-api-key
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── hooks/
│   ├── useProjects.ts    # Hook for fetching projects
│   └── useTasks.ts       # Hook for fetching tasks with pagination
└── components/
    ├── ProjectList.tsx   # Component displaying projects
    └── TaskList.tsx      # Component displaying tasks
```

## What It Demonstrates

### Custom Hooks

- **useProjects**: Fetches all projects with loading and error states
- **useTasks**: Fetches tasks with pagination support

### Components

- **ProjectList**: Displays projects with nested tasklists
- **TaskList**: Displays tasks with infinite scroll/load more

## Usage in Your App

```tsx
import { ProjectList } from './components/ProjectList';

function App() {
  return (
    <div>
      <h1>My Freelo Projects</h1>
      <ProjectList />
    </div>
  );
}
```

## Notes

- In production, consider using React Context or a state management library to share the Freelo client instance
- Handle API key securely - never expose it in client-side code in production
- For production use, proxy requests through your backend server

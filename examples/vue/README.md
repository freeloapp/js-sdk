# Vue Example

Example Vue 3 application using the Freelo SDK.

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
├── composables/
│   └── useProjects.ts    # Composable for fetching projects
└── components/
    └── ProjectList.vue   # Component displaying projects
```

## What It Demonstrates

### Composables

- **useProjects**: Vue composable for fetching and managing project data

### Components

- **ProjectList.vue**: Single File Component with script setup, template, and scoped styles

## Usage in Your App

```vue
<script setup lang="ts">
import ProjectList from './components/ProjectList.vue';
</script>

<template>
  <div>
    <h1>My Freelo Projects</h1>
    <ProjectList />
  </div>
</template>
```

## Using the Composable Separately

```vue
<script setup lang="ts">
import { useProjects } from './composables/useProjects';

const { projects, loading, error, refetch } = useProjects();
</script>

<template>
  <div v-if="loading">Loading...</div>
  <ul v-else>
    <li v-for="project in projects" :key="project.id">
      {{ project.name }}
    </li>
  </ul>
</template>
```

## Notes

- In production, consider using Pinia for state management
- Handle API key securely - never expose it in client-side code in production
- For production use, proxy requests through your backend server

<script setup lang="ts">
/**
 * Freelo SDK - Vue Component Example
 *
 * Component for displaying a list of projects.
 */

import { ref, onMounted } from 'vue';
import { createFreelo, getProjects, isFreeloError } from '@freeloapp/js-sdk';

createFreelo({
  auth: { type: 'basic', email: import.meta.env.VITE_FREELO_EMAIL, apiKey: import.meta.env.VITE_FREELO_API_KEY },
  userAgent: 'VueApp/1.0',
});

interface Project {
  id: number;
  name: string;
  tasklists?: { id: number; name: string }[];
}

const projects = ref<Project[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

async function fetchProjects() {
  loading.value = true;
  error.value = null;

  const { data, error: apiError } = await getProjects();

  if (apiError) {
    if (isFreeloError(apiError)) {
      error.value = `API Error: ${String(apiError)}`;
    } else {
      error.value = 'Failed to fetch projects';
    }
    loading.value = false;
    return;
  }

  projects.value = data;
  loading.value = false;
}

onMounted(fetchProjects);
</script>

<template>
  <div class="project-list">
    <div v-if="loading" class="loading">Loading projects...</div>

    <div v-else-if="error" class="error">
      <p>Error: {{ error }}</p>
      <button @click="fetchProjects">Retry</button>
    </div>

    <div v-else-if="projects.length === 0" class="empty">
      No projects found.
    </div>

    <div v-else>
      <h2>Projects ({{ projects.length }})</h2>
      <ul>
        <li v-for="project in projects" :key="project.id" class="project-item">
          <h3>{{ project.name }}</h3>
          <ul v-if="project.tasklists?.length" class="tasklist-list">
            <li v-for="tasklist in project.tasklists" :key="tasklist.id">
              {{ tasklist.name }}
            </li>
          </ul>
        </li>
      </ul>
      <button @click="fetchProjects">Refresh</button>
    </div>
  </div>
</template>

<style scoped>
.project-list {
  padding: 1rem;
}

.project-item {
  margin-bottom: 1rem;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.project-item h3 {
  margin: 0 0 0.5rem 0;
}

.tasklist-list {
  margin-left: 1rem;
  color: #666;
}

.loading,
.empty {
  color: #666;
  font-style: italic;
}

.error {
  color: #c00;
}

button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
}
</style>

/**
 * Freelo SDK - Vue Composable Example
 *
 * Composable for fetching projects from Freelo.
 */

import { ref, onMounted, type Ref } from 'vue';
import { createFreelo, getProjects, isFreeloError } from '@freeloapp/js-sdk';

createFreelo({
  email: import.meta.env.VITE_FREELO_EMAIL,
  apiKey: import.meta.env.VITE_FREELO_API_KEY,
  userAgent: 'VueApp/1.0',
});

interface Project {
  id: number;
  name: string;
  tasklists?: { id: number; name: string }[];
}

export interface UseProjectsReturn {
  projects: Ref<Project[]>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  refetch: () => Promise<void>;
}

export function useProjects(): UseProjectsReturn {
  const projects = ref<Project[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);

  async function refetch() {
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

  onMounted(refetch);

  return {
    projects,
    loading,
    error,
    refetch,
  };
}

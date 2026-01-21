/**
 * Freelo SDK - Vue Composable Example
 *
 * Composable for fetching projects from Freelo.
 */

import { ref, onMounted, type Ref } from 'vue';
import { Freelo, type ProjectWithTasklists, FreeloApiError } from '@freelo/js-sdk';

const freelo = new Freelo({
  email: import.meta.env.VITE_FREELO_EMAIL,
  apiKey: import.meta.env.VITE_FREELO_API_KEY,
  userAgent: 'VueApp/1.0',
});

export interface UseProjectsReturn {
  projects: Ref<ProjectWithTasklists[]>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  refetch: () => Promise<void>;
}

export function useProjects(): UseProjectsReturn {
  const projects = ref<ProjectWithTasklists[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);

  async function refetch() {
    loading.value = true;
    error.value = null;

    try {
      projects.value = await freelo.projects.list();
    } catch (e) {
      if (e instanceof FreeloApiError) {
        error.value = `API Error: ${e.message}`;
      } else {
        error.value = e instanceof Error ? e.message : 'Failed to fetch projects';
      }
    } finally {
      loading.value = false;
    }
  }

  onMounted(refetch);

  return {
    projects,
    loading,
    error,
    refetch,
  };
}

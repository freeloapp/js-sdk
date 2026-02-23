/**
 * Freelo SDK - React Hook Example
 *
 * Custom hook for fetching projects from Freelo.
 */

import { useState, useEffect } from 'react';
import { createFreelo, getProjects, isFreeloError } from '@freeloapp/js-sdk';

// Initialize the client (in a real app, consider using React Context)
createFreelo({
  email: import.meta.env.VITE_FREELO_EMAIL,
  apiKey: import.meta.env.VITE_FREELO_API_KEY,
  userAgent: 'ReactApp/1.0',
});

interface Project {
  id: number;
  name: string;
  tasklists?: { id: number; name: string }[];
}

export interface UseProjectsResult {
  projects: Project[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useProjects(): UseProjectsResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    const { data, error: apiError } = await getProjects();

    if (apiError) {
      if (isFreeloError(apiError)) {
        setError(new Error(`API Error: ${String(apiError)}`));
      } else {
        setError(new Error('Failed to fetch projects'));
      }
      setLoading(false);
      return;
    }

    setProjects(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return { projects, loading, error, refetch: fetchProjects };
}

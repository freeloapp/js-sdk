/**
 * Freelo SDK - React Hook Example
 *
 * Custom hook for fetching projects from Freelo.
 */

import { useState, useEffect } from 'react';
import { Freelo, type ProjectWithTasklists } from '@freeloapp/js-sdk';

// Initialize the client (in a real app, consider using React Context)
const freelo = new Freelo({
  email: import.meta.env.VITE_FREELO_EMAIL,
  apiKey: import.meta.env.VITE_FREELO_API_KEY,
  userAgent: 'ReactApp/1.0',
});

export interface UseProjectsResult {
  projects: ProjectWithTasklists[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useProjects(): UseProjectsResult {
  const [projects, setProjects] = useState<ProjectWithTasklists[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await freelo.projects.list();
      setProjects(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch projects'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return { projects, loading, error, refetch: fetchProjects };
}

/**
 * Freelo SDK - React Hook for Tasks
 *
 * Custom hook for fetching tasks from Freelo.
 */

import { useState, useEffect, useCallback } from 'react';
import { Freelo, type TaskFull, FreeloApiError } from '@freeloapp/js-sdk';

// Initialize the client
const freelo = new Freelo({
  email: import.meta.env.VITE_FREELO_EMAIL,
  apiKey: import.meta.env.VITE_FREELO_API_KEY,
  userAgent: 'ReactApp/1.0',
});

export interface UseTasksResult {
  tasks: TaskFull[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => void;
}

export function useTasks(tasklistId: number): UseTasksResult {
  const [tasks, setTasks] = useState<TaskFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchTasks = useCallback(
    async (pageNum: number, append = false) => {
      setLoading(true);
      setError(null);
      try {
        const response = await freelo.tasks.listByTasklist(tasklistId, pageNum);
        const newTasks = response.data.tasks;

        setTasks((prev) => (append ? [...prev, ...newTasks] : newTasks));
        setHasMore(response.count > (pageNum + 1) * 20); // Assuming 20 items per page
      } catch (e) {
        if (e instanceof FreeloApiError) {
          setError(new Error(`API Error: ${e.message}`));
        } else {
          setError(e instanceof Error ? e : new Error('Failed to fetch tasks'));
        }
      } finally {
        setLoading(false);
      }
    },
    [tasklistId]
  );

  useEffect(() => {
    setPage(0);
    fetchTasks(0);
  }, [fetchTasks]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTasks(nextPage, true);
    }
  }, [loading, hasMore, page, fetchTasks]);

  const refetch = useCallback(() => {
    setPage(0);
    fetchTasks(0);
  }, [fetchTasks]);

  return { tasks, loading, error, hasMore, loadMore, refetch };
}

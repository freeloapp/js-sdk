/**
 * Freelo SDK - React Hook for Tasks
 *
 * Custom hook for fetching tasks from Freelo.
 */

import { useState, useEffect, useCallback } from 'react';
import { getTasksInTasklist, isFreeloError } from '@freeloapp/js-sdk';

interface TaskItem {
  id: number;
  name: string;
  due_date?: string | null;
  labels?: { name: string; color?: string }[];
}

export interface UseTasksResult {
  tasks: TaskItem[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => void;
}

export function useTasks(tasklistId: number): UseTasksResult {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchTasks = useCallback(
    async (pageNum: number, append = false) => {
      setLoading(true);
      setError(null);

      const { data, error: apiError } = await getTasksInTasklist({
        path: { tasklist_id: tasklistId },
        query: { p: pageNum },
      });

      if (apiError) {
        if (isFreeloError(apiError)) {
          setError(new Error(`API Error: ${String(apiError)}`));
        } else {
          setError(new Error('Failed to fetch tasks'));
        }
        setLoading(false);
        return;
      }

      const newTasks = data.tasks ?? [];
      setTasks((prev) => (append ? [...prev, ...newTasks] : newTasks));
      setHasMore(data.count > (pageNum + 1) * 20); // Assuming 20 items per page
      setLoading(false);
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

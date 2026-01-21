/**
 * Freelo SDK - React Component Example
 *
 * Component for displaying a list of tasks with infinite scroll.
 */

import { useTasks } from '../hooks/useTasks';

interface TaskListProps {
  tasklistId: number;
}

export function TaskList({ tasklistId }: TaskListProps) {
  const { tasks, loading, error, hasMore, loadMore, refetch } = useTasks(tasklistId);

  if (error) {
    return (
      <div className="error">
        <p>Error: {error.message}</p>
        <button onClick={refetch}>Retry</button>
      </div>
    );
  }

  return (
    <div className="task-list">
      <h2>Tasks</h2>
      <ul>
        {tasks.map((task) => (
          <li key={task.id} className="task-item">
            <div className="task-header">
              <span className="task-name">{task.name}</span>
              {task.due_date && (
                <span className="task-due-date">Due: {task.due_date}</span>
              )}
            </div>
            {task.labels && task.labels.length > 0 && (
              <div className="task-labels">
                {task.labels.map((label, idx) => (
                  <span
                    key={idx}
                    className="label"
                    style={{ backgroundColor: label.color }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>

      {loading && <div className="loading">Loading...</div>}

      {hasMore && !loading && (
        <button onClick={loadMore} className="load-more">
          Load More
        </button>
      )}
    </div>
  );
}

/**
 * Freelo SDK - React Component Example
 *
 * Component for displaying a list of projects.
 */

import { useProjects } from '../hooks/useProjects';

export function ProjectList() {
  const { projects, loading, error, refetch } = useProjects();

  if (loading) {
    return <div className="loading">Loading projects...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>Error: {error.message}</p>
        <button onClick={refetch}>Retry</button>
      </div>
    );
  }

  if (projects.length === 0) {
    return <div className="empty">No projects found.</div>;
  }

  return (
    <div className="project-list">
      <h2>Projects ({projects.length})</h2>
      <ul>
        {projects.map((project) => (
          <li key={project.id} className="project-item">
            <h3>{project.name}</h3>
            {project.tasklists && project.tasklists.length > 0 && (
              <ul className="tasklist-list">
                {project.tasklists.map((tasklist) => (
                  <li key={tasklist.id}>{tasklist.name}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}

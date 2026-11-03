/**
 * Freelo SDK - Advanced Bulk Operations Example
 *
 * Demonstrates patterns for performing bulk operations efficiently.
 */

import {
  createFreelo,
  getProjects,
  createTask,
  finishTask,
  addTaskLabelsToTask,
  moveTask,
  archiveProject,
  getTasksInTasklist,
  isFreeloError,
  isRateLimited,
} from '@freeloapp/js-sdk';

createFreelo({
  auth: { type: 'basic', email: process.env.FREELO_EMAIL!, apiKey: process.env.FREELO_API_KEY! },
  userAgent: 'BulkOperationsDemo/1.0',
});

/**
 * Example 1: Create multiple tasks with controlled concurrency
 */
async function createMultipleTasks(
  tasklistId: number,
  taskNames: string[],
  concurrency = 3
): Promise<{ succeeded: number; failed: number }> {
  let succeeded = 0;
  let failed = 0;

  // Process in batches
  for (let i = 0; i < taskNames.length; i += concurrency) {
    const batch = taskNames.slice(i, i + concurrency);

    const results = await Promise.allSettled(
      batch.map((name) =>
        createTask({ path: { tasklist_id: tasklistId }, body: { name } })
      )
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        succeeded++;
        console.log(`  Created: ${result.value.data.name}`);
      } else {
        failed++;
        console.error(`  Failed: ${result.reason}`);
      }
    }

    // Small delay between batches to avoid rate limiting
    if (i + concurrency < taskNames.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return { succeeded, failed };
}

/**
 * Example 2: Finish multiple tasks
 */
async function finishTasks(taskIds: number[]): Promise<{ succeeded: number[]; failed: number[] }> {
  const succeeded: number[] = [];
  const failed: number[] = [];

  const results = await Promise.allSettled(
    taskIds.map((id) => finishTask({ path: { task_id: id } }))
  );

  results.forEach((result, index) => {
    const taskId = taskIds[index];
    if (taskId === undefined) return;
    if (result.status === 'fulfilled') {
      succeeded.push(taskId);
    } else {
      failed.push(taskId);
    }
  });

  return { succeeded, failed };
}

/**
 * Example 3: Add labels to multiple tasks
 */
async function addLabelsToTasks(taskIds: number[], labels: { name: string; color?: string }[]) {
  const results = await Promise.allSettled(
    taskIds.map((taskId) =>
      addTaskLabelsToTask({ path: { task_id: taskId }, body: labels })
    )
  );

  const succeeded = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  console.log(`Added labels: ${succeeded} succeeded, ${failed} failed`);
  return { succeeded, failed };
}

/**
 * How long to wait after a 429: the `Retry-After` header (seconds) is
 * authoritative; on repeated 429s back off exponentially. Without the
 * header, fall back to exponential backoff from `fallbackMs`.
 */
function rateLimitDelayMs(response: Response | undefined, attempt: number, fallbackMs = 1000): number {
  const backoffMs = fallbackMs * 2 ** attempt;
  const retryAfter = Number(response?.headers.get('Retry-After'));
  if (!Number.isFinite(retryAfter) || retryAfter <= 0) return backoffMs;
  return Math.max(retryAfter * 1000, attempt > 0 ? backoffMs : 0);
}

/**
 * Example 4: Batch update with rate limit handling (honors Retry-After)
 */
async function batchUpdateWithRateLimit<T, R>(
  items: T[],
  updateFn: (item: T) => Promise<{ data: R; error?: unknown; response?: Response }>,
  options: { batchSize?: number; delayMs?: number; maxRetries?: number } = {}
): Promise<{ results: R[]; errors: Error[] }> {
  const { batchSize = 5, delayMs = 200, maxRetries = 3 } = options;

  const results: R[] = [];
  const errors: Error[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    for (const item of batch) {
      let result = await updateFn(item);
      // Retry the item while rate limited, waiting as the API asks
      for (let attempt = 0; result.error && isRateLimited(result.error) && attempt < maxRetries; attempt++) {
        const waitMs = rateLimitDelayMs(result.response, attempt);
        console.log(`Rate limited. Waiting ${waitMs / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        result = await updateFn(item);
      }
      if (result.error) {
        errors.push(new Error(String(result.error)));
      } else {
        results.push(result.data);
      }
    }

    // Delay between batches
    if (i + batchSize < items.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return { results, errors };
}

/**
 * Example 5: Move tasks between tasklists
 */
async function moveTasksToTasklist(taskIds: number[], targetTasklistId: number) {
  console.log(`Moving ${taskIds.length} tasks to tasklist ${targetTasklistId}...`);

  const { results, errors } = await batchUpdateWithRateLimit(
    taskIds,
    (taskId) => moveTask({ path: { task_id: taskId }, body: { tasklist_id: targetTasklistId } }),
    { batchSize: 5, delayMs: 200 }
  );

  console.log(`  Moved: ${results.length}`);
  console.log(`  Failed: ${errors.length}`);

  return { moved: results.length, failed: errors.length };
}

/**
 * Example 6: Bulk archive projects
 */
async function archiveProjectsBulk(projectIds: number[]) {
  const results = await batchUpdateWithRateLimit(
    projectIds,
    (projectId) => archiveProject({ path: { project_id: projectId } }),
    { batchSize: 3, delayMs: 500 }
  );

  return {
    archived: results.results.length,
    failed: results.errors.length,
  };
}

// Demo usage
async function demo() {
  // Get a tasklist ID for testing
  const { data: projects } = await getProjects();
  if (projects.length === 0 || !projects[0].tasklists?.length) {
    console.log('No projects or tasklists found for demo');
    return;
  }

  const tasklistId = projects[0].tasklists[0].id;

  // Example 1: Create multiple tasks
  console.log('=== Creating Multiple Tasks ===');
  const taskNames = ['Bulk Task 1', 'Bulk Task 2', 'Bulk Task 3', 'Bulk Task 4', 'Bulk Task 5'];
  const createResult = await createMultipleTasks(tasklistId, taskNames, 2);
  console.log(`Created: ${createResult.succeeded}, Failed: ${createResult.failed}\n`);

  // Example 2: Get task IDs and finish some
  console.log('=== Fetching Tasks ===');
  const { data: tasksResponse } = await getTasksInTasklist({ path: { tasklist_id: tasklistId } });
  const taskIds = tasksResponse.tasks.slice(0, 3).map((t: { id: number }) => t.id);
  console.log(`Found ${taskIds.length} tasks to process\n`);

  // Example 3: Add labels
  console.log('=== Adding Labels ===');
  await addLabelsToTasks(taskIds, [{ name: 'bulk-processed', color: '#FF5733' }]);
}

demo().catch(console.error);

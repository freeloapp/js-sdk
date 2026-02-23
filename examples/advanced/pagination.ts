/**
 * Freelo SDK - Advanced Pagination Example
 *
 * Demonstrates different pagination strategies.
 */

import { createFreelo, getAllTasks, getAllProjects } from '@freeloapp/js-sdk';

createFreelo({
  auth: { type: 'basic', email: process.env.FREELO_EMAIL!, apiKey: process.env.FREELO_API_KEY! },
  userAgent: 'PaginationDemo/1.0',
});

interface TaskItem {
  id: number;
  name: string;
  due_date?: string | null;
  labels?: { name: string; color?: string }[];
}

interface ProjectItem {
  id: number;
  name: string;
  state?: { name: string };
}

/**
 * Example 1: Manual pagination with while loop
 */
async function getAllTasksManual(): Promise<TaskItem[]> {
  const allTasks: TaskItem[] = [];
  let page = 0;
  let hasMore = true;

  console.log('Fetching all tasks (manual pagination)...');

  while (hasMore) {
    const { data: response } = await getAllTasks({ query: { p: page } });
    const tasks = response.tasks ?? [];
    allTasks.push(...tasks);

    console.log(`  Page ${page + 1}: fetched ${tasks.length} tasks (total: ${allTasks.length})`);

    // Check if there are more pages
    hasMore = response.count > allTasks.length;
    page++;
  }

  return allTasks;
}

/**
 * Example 2: Async generator for memory-efficient iteration
 */
async function* iterateTasks(): AsyncGenerator<TaskItem, void, unknown> {
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const { data: response } = await getAllTasks({ query: { p: page } });
    const tasks = response.tasks ?? [];

    for (const task of tasks) {
      yield task;
    }

    hasMore = response.count > (page + 1) * tasks.length;
    page++;
  }
}

/**
 * Example 3: Batch processing with concurrency control
 */
async function processTasksInBatches(
  processor: (task: TaskItem) => Promise<void>,
  concurrency = 5
): Promise<void> {
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const { data: response } = await getAllTasks({ query: { p: page } });
    const tasks = response.tasks ?? [];

    // Process in batches with controlled concurrency
    for (let i = 0; i < tasks.length; i += concurrency) {
      const batch = tasks.slice(i, i + concurrency);
      await Promise.all(batch.map(processor));
    }

    hasMore = response.count > (page + 1) * tasks.length;
    page++;
  }
}

/**
 * Example 4: Parallel page fetching (use with caution - can hit rate limits)
 */
async function getAllProjectsParallel(): Promise<ProjectItem[]> {
  // First, get the total count
  const { data: firstPage } = await getAllProjects({ query: { p: 0 } });
  const totalPages = Math.ceil(firstPage.total / 20); // Assuming 20 items per page

  if (totalPages <= 1) {
    return firstPage.projects;
  }

  console.log(`Fetching ${totalPages} pages in parallel...`);

  // Fetch remaining pages in parallel (with some limit to avoid rate limiting)
  const pagePromises = [];
  for (let page = 1; page < totalPages; page++) {
    pagePromises.push(getAllProjects({ query: { p: page } }));
  }

  const results = await Promise.all(pagePromises);

  // Combine all results
  const allProjects = [...firstPage.projects];
  for (const result of results) {
    allProjects.push(...result.data.projects);
  }

  return allProjects;
}

/**
 * Example 5: Cursor-like pagination helper
 */
class TaskPaginator {
  private currentPage = 0;
  private cachedTotal = 0;

  async next(): Promise<{ tasks: TaskItem[]; done: boolean }> {
    const { data: response } = await getAllTasks({ query: { p: this.currentPage } });
    const tasks = response.tasks ?? [];
    this.cachedTotal = response.total;
    this.currentPage++;

    const fetched = this.currentPage * tasks.length;
    const done = fetched >= response.count;

    return { tasks, done };
  }

  reset(): void {
    this.currentPage = 0;
  }

  get total(): number {
    return this.cachedTotal;
  }
}

// Demo usage
async function demo() {
  // Example 1: Manual pagination
  console.log('=== Manual Pagination ===');
  const allTasks = await getAllTasksManual();
  console.log(`Total tasks: ${allTasks.length}\n`);

  // Example 2: Async generator
  console.log('=== Async Generator ===');
  let count = 0;
  for await (const task of iterateTasks()) {
    count++;
    if (count <= 3) {
      console.log(`  Task: ${task.name}`);
    }
  }
  console.log(`  ... and ${count - 3} more tasks\n`);

  // Example 3: Batch processing
  console.log('=== Batch Processing ===');
  let processed = 0;
  await processTasksInBatches(async (task) => {
    processed++;
    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 10));
  }, 5);
  console.log(`  Processed ${processed} tasks\n`);

  // Example 5: Paginator class
  console.log('=== Paginator Class ===');
  const paginator = new TaskPaginator();
  let result = await paginator.next();
  console.log(`  First page: ${result.tasks.length} tasks`);
  if (!result.done) {
    result = await paginator.next();
    console.log(`  Second page: ${result.tasks.length} tasks`);
  }
  console.log(`  Total: ${paginator.total}`);
}

demo().catch(console.error);

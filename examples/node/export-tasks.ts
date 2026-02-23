/**
 * Freelo SDK - Node.js Export Tasks Example
 *
 * Script that exports all tasks to a JSON file.
 */

import { writeFileSync } from 'fs';
import { createFreelo, getAllTasks, isFreeloError, isRateLimited } from '@freeloapp/js-sdk';

createFreelo({
  email: process.env.FREELO_EMAIL!,
  apiKey: process.env.FREELO_API_KEY!,
  userAgent: 'ExportScript/1.0',
});

interface ExportedTask {
  id: number;
  name: string;
  due_date: string | null;
  project: string;
  tasklist: string;
  labels: string[];
}

async function exportTasks(outputFile: string) {
  console.log('Exporting all tasks...\n');

  const exportedTasks: ExportedTask[] = [];
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const { data: response, error } = await getAllTasks({ query: { p: page } });

    if (error) {
      if (isRateLimited(error)) {
        console.error('Rate limited - saving partial results...');
        writeFileSync(outputFile, JSON.stringify(exportedTasks, null, 2));
        console.log(`Partial export: ${exportedTasks.length} tasks saved to ${outputFile}`);
        return;
      }
      if (isFreeloError(error)) {
        console.error(`API Error:`, error);
      }
      break;
    }

    const tasks = response.tasks ?? [];

    for (const task of tasks) {
      exportedTasks.push({
        id: task.id,
        name: task.name,
        due_date: task.due_date,
        project: task.project?.name || 'Unknown',
        tasklist: task.tasklist?.name || 'Unknown',
        labels: task.labels?.map((l: { name: string }) => l.name) || [],
      });
    }

    console.log(`Fetched page ${page + 1} (${exportedTasks.length} tasks so far)`);

    hasMore = response.count > exportedTasks.length;
    page++;

    // Small delay to avoid rate limiting
    if (hasMore) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  // Write to file
  writeFileSync(outputFile, JSON.stringify(exportedTasks, null, 2));
  console.log(`\nExported ${exportedTasks.length} tasks to ${outputFile}`);
}

// Get output file from command line or use default
const outputFile = process.argv[2] || 'tasks-export.json';
exportTasks(outputFile).catch(console.error);

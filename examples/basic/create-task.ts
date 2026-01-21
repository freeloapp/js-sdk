/**
 * Freelo SDK - Create Task Example
 *
 * This example demonstrates how to create tasks with subtasks and comments.
 */

import { Freelo } from '@freeloapp/js-sdk';

const freelo = new Freelo({
  email: process.env.FREELO_EMAIL!,
  apiKey: process.env.FREELO_API_KEY!,
  userAgent: 'MyApp/1.0',
});

// Replace with your actual IDs
const tasklistId = 12345;
const userId = 67890;

async function createTaskWithSubtasks() {
  // Create a task with subtasks
  const task = await freelo.tasks.create(tasklistId, {
    name: 'Implement new feature',
    due_date: '2024-12-31',
    worker: userId,
    subtasks: [
      { name: 'Design' },
      { name: 'Implementation' },
      { name: 'Testing' },
      { name: 'Documentation' },
    ],
  });

  console.log(`Created task: ${task.name} (ID: ${task.id})`);

  // Add a comment to the task
  const comment = await freelo.comments.create(task.id, {
    content: 'Please prioritize this task',
  });

  console.log(`Added comment: ${comment.content}`);
}

createTaskWithSubtasks().catch(console.error);

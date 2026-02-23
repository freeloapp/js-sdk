/**
 * Freelo SDK - Time Tracking Example
 *
 * This example demonstrates how to start and stop time tracking.
 */

import { createFreelo, startTimeTracking, stopTimeTracking } from '@freeloapp/js-sdk';

createFreelo({
  email: process.env.FREELO_EMAIL!,
  apiKey: process.env.FREELO_API_KEY!,
  userAgent: 'MyApp/1.0',
});

async function trackTime(taskId: number) {
  // Start tracking time on a task
  const { data: tracking } = await startTimeTracking({
    path: { task_id: taskId },
    body: {
      note: 'Working on feature implementation',
    },
  });

  console.log(`Time tracking started (UUID: ${tracking.uuid})`);

  // Simulate some work
  console.log('Working...');
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Stop tracking and get the work report
  const { data: report } = await stopTimeTracking({
    path: { task_id: taskId },
  });

  console.log(`Time tracked: ${report.time_tracked} seconds`);
  console.log(`Date: ${report.date_report}`);
}

// Replace with your actual task ID
const taskId = 12345;
trackTime(taskId).catch(console.error);

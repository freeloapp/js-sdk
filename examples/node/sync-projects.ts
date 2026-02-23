/**
 * Freelo SDK - Node.js Sync Script Example
 *
 * Script that fetches and displays all projects with their details.
 */

import {
  createFreelo,
  getAllProjects,
  getProject,
  isFreeloError,
  isRateLimited,
} from '@freeloapp/js-sdk';

createFreelo({
  email: process.env.FREELO_EMAIL!,
  apiKey: process.env.FREELO_API_KEY!,
  userAgent: 'SyncScript/1.0 (admin@company.com)',
});

async function syncProjects() {
  console.log('Fetching all projects...\n');

  // Get all projects with pagination
  const { data: response, error } = await getAllProjects();

  if (error) {
    if (isRateLimited(error)) {
      console.error('Rate limited - please wait 60 seconds and try again.');
    } else if (isFreeloError(error)) {
      console.error(`API Error:`, error);
    } else {
      console.error('Error:', error);
    }
    process.exit(1);
  }

  console.log(`Found ${response.total} project(s)\n`);

  for (const project of response.projects) {
    console.log(`Project: ${project.name} (ID: ${project.id})`);
    console.log(`  State: ${project.state?.name || 'N/A'}`);

    // Get project details
    const { data: detail, error: detailError } = await getProject({
      path: { project_id: project.id },
    });

    if (detailError) {
      console.log('  Could not fetch details');
      console.log('');
      continue;
    }

    console.log(`  Workers: ${detail.workers?.length || 0}`);
    console.log(`  Tasklists: ${detail.tasklists?.length || 0}`);
    console.log(`  Tasks: ${detail.tasks?.count || 0}`);
    console.log('');
  }

  console.log('Sync completed successfully!');
}

syncProjects();

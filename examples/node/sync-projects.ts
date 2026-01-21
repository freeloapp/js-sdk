/**
 * Freelo SDK - Node.js Sync Script Example
 *
 * Script that fetches and displays all projects with their details.
 */

import { Freelo, FreeloApiError } from '@freeloapp/js-sdk';

const freelo = new Freelo({
  email: process.env.FREELO_EMAIL!,
  apiKey: process.env.FREELO_API_KEY!,
  userAgent: 'SyncScript/1.0 (admin@company.com)',
});

async function syncProjects() {
  console.log('Fetching all projects...\n');

  try {
    // Get all projects with pagination
    const response = await freelo.projects.listAll();

    console.log(`Found ${response.total} project(s)\n`);

    for (const project of response.data.projects) {
      console.log(`Project: ${project.name} (ID: ${project.id})`);
      console.log(`  State: ${project.state?.name || 'N/A'}`);

      // Get project details
      const detail = await freelo.projects.get(project.id);

      console.log(`  Workers: ${detail.workers?.length || 0}`);
      console.log(`  Tasklists: ${detail.tasklists?.length || 0}`);
      console.log(`  Tasks: ${detail.tasks?.count || 0}`);
      console.log('');
    }

    console.log('Sync completed successfully!');
  } catch (error: unknown) {
    if (error instanceof FreeloApiError) {
      console.error(`API Error: ${error.message} (Status: ${error.status})`);
      if (error.isRateLimited) {
        console.error('Rate limited - please wait 60 seconds and try again.');
      }
    } else {
      console.error('Error:', error);
    }
    process.exit(1);
  }
}

syncProjects();

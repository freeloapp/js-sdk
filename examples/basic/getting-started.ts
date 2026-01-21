/**
 * Freelo SDK - Getting Started Example
 *
 * This example demonstrates how to initialize the SDK and list all projects.
 */

import { Freelo } from '@freelo/js-sdk';

// Initialize the client
const freelo = new Freelo({
  email: 'your@email.tld',
  apiKey: 'your-api-key',
  userAgent: 'MyApp/1.0 (contact@myapp.com)',
});

// List all projects
async function listProjects() {
  const projects = await freelo.projects.list();

  for (const project of projects) {
    console.log(`${project.name} (ID: ${project.id})`);

    // List tasklists in project
    if (project.tasklists) {
      for (const tasklist of project.tasklists) {
        console.log(`  - ${tasklist.name}`);
      }
    }
  }
}

listProjects().catch(console.error);

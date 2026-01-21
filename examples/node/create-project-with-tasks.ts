/**
 * Freelo SDK - Node.js Create Project with Tasks Example
 *
 * Script that creates a project with tasklists and tasks from a config.
 */

import { Freelo, FreeloApiError } from '@freeloapp/js-sdk';

const freelo = new Freelo({
  email: process.env.FREELO_EMAIL!,
  apiKey: process.env.FREELO_API_KEY!,
  userAgent: 'SetupScript/1.0',
});

// Project template configuration
const projectTemplate = {
  name: 'New Website Project',
  tasklists: [
    {
      name: 'Design',
      tasks: [
        { name: 'Create wireframes', subtasks: ['Homepage', 'Product page', 'Cart page'] },
        { name: 'Design mockups' },
        { name: 'Get design approval' },
      ],
    },
    {
      name: 'Development',
      tasks: [
        { name: 'Set up development environment' },
        { name: 'Implement frontend' },
        { name: 'Implement backend' },
        { name: 'Integration testing' },
      ],
    },
    {
      name: 'Launch',
      tasks: [
        { name: 'Deploy to staging' },
        { name: 'Final QA' },
        { name: 'Deploy to production' },
      ],
    },
  ],
};

async function createProjectFromTemplate() {
  console.log(`Creating project: ${projectTemplate.name}\n`);

  try {
    // Create the project
    const project = await freelo.projects.create({
      name: projectTemplate.name,
    });
    console.log(`Created project: ${project.name} (ID: ${project.id})`);

    // Create tasklists and tasks
    for (const tasklistTemplate of projectTemplate.tasklists) {
      // Create tasklist
      const tasklist = await freelo.tasklists.create(project.id, {
        name: tasklistTemplate.name,
      });
      console.log(`  Created tasklist: ${tasklist.name}`);

      // Create tasks in the tasklist
      for (const taskTemplate of tasklistTemplate.tasks) {
        const task = await freelo.tasks.create(tasklist.id, {
          name: taskTemplate.name,
          subtasks: taskTemplate.subtasks?.map((name) => ({ name })),
        });
        console.log(`    Created task: ${task.name}`);
      }
    }

    console.log('\nProject setup complete!');
    console.log(`View at: https://app.freelo.io/project/${project.id}`);
  } catch (error: unknown) {
    if (error instanceof FreeloApiError) {
      console.error(`API Error: ${error.message}`);
      if (error.errors) {
        console.error('Validation errors:', error.errors);
      }
    } else {
      throw error;
    }
    process.exit(1);
  }
}

createProjectFromTemplate();

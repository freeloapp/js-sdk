/**
 * Freelo SDK - Node.js Create Project with Tasks Example
 *
 * Script that creates a project with tasklists and tasks from a config.
 */

import {
  createFreelo,
  createProject,
  createTasklist,
  createTask,
  isFreeloError,
} from '@freeloapp/js-sdk';

createFreelo({
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

  // Create the project
  const { data: project, error: projectError } = await createProject({
    body: { name: projectTemplate.name },
  });

  if (projectError) {
    if (isFreeloError(projectError)) {
      console.error(`API Error:`, projectError);
    }
    process.exit(1);
  }

  console.log(`Created project: ${project.name} (ID: ${project.id})`);

  // Create tasklists and tasks
  for (const tasklistTemplate of projectTemplate.tasklists) {
    // Create tasklist
    const { data: tasklist, error: tasklistError } = await createTasklist({
      path: { project_id: project.id },
      body: { name: tasklistTemplate.name },
    });

    if (tasklistError) {
      console.error(`Failed to create tasklist: ${tasklistTemplate.name}`, tasklistError);
      continue;
    }

    console.log(`  Created tasklist: ${tasklist.name}`);

    // Create tasks in the tasklist
    for (const taskTemplate of tasklistTemplate.tasks) {
      const { data: task, error: taskError } = await createTask({
        path: { tasklist_id: tasklist.id },
        body: {
          name: taskTemplate.name,
          subtasks: taskTemplate.subtasks?.map((name) => ({ name })),
        },
      });

      if (taskError) {
        console.error(`Failed to create task: ${taskTemplate.name}`, taskError);
        continue;
      }

      console.log(`    Created task: ${task.name}`);
    }
  }

  console.log('\nProject setup complete!');
  console.log(`View at: https://app.freelo.io/project/${project.id}`);
}

createProjectFromTemplate();

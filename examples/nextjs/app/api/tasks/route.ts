/**
 * Freelo SDK - Next.js API Route Example
 *
 * API routes for handling task operations.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { getAllTasks, createTask, isFreeloError } from '@freeloapp/js-sdk';
import { initFreelo } from '../../../lib/freelo';

initFreelo();

/**
 * GET /api/tasks
 * Fetch all tasks (with optional pagination)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page');

  const { data, error } = await getAllTasks({
    query: { p: page ? parseInt(page, 10) : undefined },
  });

  if (error) {
    if (isFreeloError(error)) {
      return NextResponse.json(
        { error: String(error) },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * POST /api/tasks
 * Create a new task
 */
export async function POST(request: Request) {
  const body = await request.json();

  // Validate required fields
  if (!body.tasklist_id) {
    return NextResponse.json({ error: 'Tasklist ID is required' }, { status: 400 });
  }
  if (!body.name) {
    return NextResponse.json({ error: 'Task name is required' }, { status: 400 });
  }

  const { data, error } = await createTask({
    path: { tasklist_id: body.tasklist_id },
    body: {
      name: body.name,
      due_date: body.due_date,
      worker: body.worker_id,
      subtasks: body.subtasks,
    },
  });

  if (error) {
    if (isFreeloError(error)) {
      return NextResponse.json(
        { error: String(error) },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

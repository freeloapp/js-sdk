/**
 * Freelo SDK - Next.js API Route Example
 *
 * API routes for handling task operations.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { Freelo, FreeloApiError } from '@freeloapp/js-sdk';

const freelo = new Freelo({
  email: process.env.FREELO_EMAIL!,
  apiKey: process.env.FREELO_API_KEY!,
  userAgent: 'NextJS-App/1.0',
});

/**
 * GET /api/tasks
 * Fetch all tasks (with optional pagination)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page');

    const response = await freelo.tasks.list({
      page: page ? parseInt(page, 10) : undefined,
    });

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof FreeloApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 500 }
      );
    }
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

/**
 * POST /api/tasks
 * Create a new task
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.tasklist_id) {
      return NextResponse.json({ error: 'Tasklist ID is required' }, { status: 400 });
    }
    if (!body.name) {
      return NextResponse.json({ error: 'Task name is required' }, { status: 400 });
    }

    const task = await freelo.tasks.create(body.tasklist_id, {
      name: body.name,
      due_date: body.due_date,
      worker: body.worker_id,
      subtasks: body.subtasks,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof FreeloApiError) {
      return NextResponse.json(
        { error: error.message, errors: error.errors },
        { status: error.status || 500 }
      );
    }
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

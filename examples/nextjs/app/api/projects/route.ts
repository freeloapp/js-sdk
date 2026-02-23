/**
 * Freelo SDK - Next.js API Route Example
 *
 * API routes for handling project operations.
 */

import { NextResponse } from 'next/server';
import { getProjects, createProject, isFreeloError } from '@freeloapp/js-sdk';
import { initFreelo } from '../../../lib/freelo';

// Initialize the client (server-side only)
initFreelo();

/**
 * GET /api/projects
 * Fetch all projects
 */
export async function GET() {
  const { data, error } = await getProjects();

  if (error) {
    if (isFreeloError(error)) {
      return NextResponse.json(
        { error: String(error) },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * POST /api/projects
 * Create a new project
 */
export async function POST(request: Request) {
  const body = await request.json();

  // Validate required fields
  if (!body.name) {
    return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
  }

  const { data, error } = await createProject({
    body: {
      name: body.name,
      currency: body.currency,
    },
  });

  if (error) {
    if (isFreeloError(error)) {
      return NextResponse.json(
        { error: String(error) },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

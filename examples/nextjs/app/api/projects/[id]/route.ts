/**
 * Freelo SDK - Next.js API Route Example
 *
 * API routes for handling individual project operations.
 */

import { NextResponse } from 'next/server';
import { Freelo, FreeloApiError } from '@freelo/js-sdk';

const freelo = new Freelo({
  email: process.env.FREELO_EMAIL!,
  apiKey: process.env.FREELO_API_KEY!,
  userAgent: 'NextJS-App/1.0',
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/projects/[id]
 * Fetch a single project by ID
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const projectId = parseInt(id, 10);

    if (isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    const project = await freelo.projects.get(projectId);
    return NextResponse.json(project);
  } catch (error) {
    if (error instanceof FreeloApiError) {
      if (error.isNotFound) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 500 }
      );
    }
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

/**
 * DELETE /api/projects/[id]
 * Delete a project by ID
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const projectId = parseInt(id, 10);

    if (isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    await freelo.projects.delete(projectId);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof FreeloApiError) {
      if (error.isNotFound) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 500 }
      );
    }
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}

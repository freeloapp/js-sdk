/**
 * Freelo SDK - Next.js API Route Example
 *
 * API routes for handling individual project operations.
 */

import { NextResponse } from 'next/server';
import { getProject, deleteProject, isFreeloError, isNotFound } from '@freeloapp/js-sdk';
import { initFreelo } from '../../../../lib/freelo';

initFreelo();

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/projects/[id]
 * Fetch a single project by ID
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const projectId = parseInt(id, 10);

  if (isNaN(projectId)) {
    return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
  }

  const { data, error } = await getProject({ path: { project_id: projectId } });

  if (error) {
    if (isNotFound(error)) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    if (isFreeloError(error)) {
      return NextResponse.json(
        { error: String(error) },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * DELETE /api/projects/[id]
 * Delete a project by ID
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const projectId = parseInt(id, 10);

  if (isNaN(projectId)) {
    return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
  }

  const { error } = await deleteProject({ path: { project_id: projectId } });

  if (error) {
    if (isNotFound(error)) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    if (isFreeloError(error)) {
      return NextResponse.json(
        { error: String(error) },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

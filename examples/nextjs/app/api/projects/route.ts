/**
 * Freelo SDK - Next.js API Route Example
 *
 * API routes for handling project operations.
 */

import { NextResponse } from 'next/server';
import { Freelo, FreeloApiError } from '@freelo/js-sdk';

// Initialize the client (server-side only)
const freelo = new Freelo({
  email: process.env.FREELO_EMAIL!,
  apiKey: process.env.FREELO_API_KEY!,
  userAgent: 'NextJS-App/1.0',
});

/**
 * GET /api/projects
 * Fetch all projects
 */
export async function GET() {
  try {
    const projects = await freelo.projects.list();
    return NextResponse.json(projects);
  } catch (error) {
    if (error instanceof FreeloApiError) {
      return NextResponse.json(
        { error: error.message, status: error.status },
        { status: error.status || 500 }
      );
    }
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

/**
 * POST /api/projects
 * Create a new project
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const project = await freelo.projects.create({
      name: body.name,
      currency: body.currency,
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    if (error instanceof FreeloApiError) {
      return NextResponse.json(
        { error: error.message, errors: error.errors },
        { status: error.status || 500 }
      );
    }
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

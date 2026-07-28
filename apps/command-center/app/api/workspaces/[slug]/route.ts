/**
 * GET /api/workspaces/[slug]
 * Fetch a specific workspace with member information
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Check authentication
    const authToken = request.cookies.get('authToken')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = params;

    // TODO: Query database for workspace by slug with authorization check
    // For now, return demo data
    const workspaceData: Record<string, any> = {
      'wise2-enterprise': {
        workspace: {
          id: 1,
          name: 'WISE² Enterprise',
          slug: 'wise2-enterprise',
          description: 'Master workspace for WISE² platform',
          ownerId: 1,
          status: 'active',
          workspaceType: 'business',
          config: {
            automationEnabled: true,
            analyticsEnabled: true,
          },
          theme: {
            mode: 'dark',
            palette: 'enterprise',
          },
          features: [
            'crm',
            'projects',
            'automation',
            'analytics',
            'digital-workforce',
            'knowledge',
          ],
          createdAt: new Date('2026-01-01'),
          updatedAt: new Date('2026-07-28'),
        },
        member: {
          id: 1,
          workspaceId: 1,
          userId: 1,
          role: 'owner',
          permissions: ['*'],
          joinedAt: new Date('2026-01-01'),
          lastAccessedAt: new Date('2026-07-28'),
        },
      },
      'piff-city': {
        workspace: {
          id: 2,
          name: 'PIFF CITY',
          slug: 'piff-city',
          description: 'Production workspace for garment manufacturing',
          ownerId: 2,
          status: 'active',
          workspaceType: 'business',
          config: {
            automationEnabled: true,
            analyticsEnabled: true,
          },
          theme: {
            mode: 'dark',
            palette: 'enterprise',
          },
          features: [
            'crm',
            'production',
            'inventory',
            'automation',
            'analytics',
            'digital-workforce',
          ],
          createdAt: new Date('2026-03-15'),
          updatedAt: new Date('2026-07-25'),
        },
        member: {
          id: 2,
          workspaceId: 2,
          userId: 1,
          role: 'admin',
          permissions: ['manage_workflows', 'manage_automation', 'view_analytics'],
          joinedAt: new Date('2026-03-15'),
          lastAccessedAt: new Date('2026-07-26'),
        },
      },
      'wise-shine': {
        workspace: {
          id: 3,
          name: 'WISE SHINE',
          slug: 'wise-shine',
          description: 'Operations workspace for cleaning services',
          ownerId: 1,
          status: 'active',
          workspaceType: 'business',
          config: {
            automationEnabled: true,
            analyticsEnabled: true,
          },
          theme: {
            mode: 'dark',
            palette: 'enterprise',
          },
          features: ['crm', 'projects', 'automation', 'analytics'],
          createdAt: new Date('2026-05-10'),
          updatedAt: new Date('2026-07-20'),
        },
        member: {
          id: 3,
          workspaceId: 3,
          userId: 1,
          role: 'owner',
          permissions: ['*'],
          joinedAt: new Date('2026-05-10'),
          lastAccessedAt: new Date('2026-07-21'),
        },
      },
    };

    const data = workspaceData[slug];

    if (!data) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      workspace: data.workspace,
      member: data.member,
    });
  } catch (error) {
    console.error('Error fetching workspace:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workspace' },
      { status: 500 }
    );
  }
}

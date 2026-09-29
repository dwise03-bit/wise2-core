/**
 * GET /api/workspaces
 * List all workspaces for the current user
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Check authentication via authToken cookie
    const authToken = request.cookies.get('authToken')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Verify authToken and get current user
    // For now, return demo workspaces
    const workspaces = [
      {
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
      {
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
      {
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
    ];

    return NextResponse.json({
      success: true,
      workspaces,
      count: workspaces.length,
    });
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workspaces' },
      { status: 500 }
    );
  }
}

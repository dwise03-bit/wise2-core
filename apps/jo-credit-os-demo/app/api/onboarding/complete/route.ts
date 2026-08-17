import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceName, workspaceUrl, teamSize, teamEmails, timezone, notifications } = body;

    if (!workspaceName || !workspaceUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Call backend to create workspace and provision user
    const response = await fetch(`${API_BASE_URL}/v1/onboarding/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${request.headers.get('authorization')}`,
      },
      body: JSON.stringify({
        workspaceName,
        workspaceUrl,
        teamSize,
        teamEmails: teamEmails.split('\n').filter((email: string) => email.trim()),
        timezone,
        notifications,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Failed to complete onboarding' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Send welcome email
    await fetch(`${API_BASE_URL}/v1/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: body.email,
        template: 'welcome',
        data: { workspaceName, workspaceUrl },
      }),
    }).catch(console.error);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}

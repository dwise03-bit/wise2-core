import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      businessName,
      contactName,
      email,
      phone,
      website,
      industry,
      primaryProblem,
      leadSource,
      estimatedOpportunity,
      notes,
      tags,
    } = body;

    if (!businessName || !contactName || !email || !primaryProblem) {
      return NextResponse.json(
        { error: 'Missing required fields: businessName, contactName, email, primaryProblem' },
        { status: 400 }
      );
    }

    // Forward to NestJS backend
    const response = await fetch(`${API_BASE_URL}/v1/prospects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        businessName,
        contactName,
        email,
        phone: phone || undefined,
        website: website || undefined,
        industry: industry || undefined,
        primaryProblem,
        leadSource: leadSource || 'DIRECT',
        estimatedOpportunity: estimatedOpportunity || 0,
        notes: notes || undefined,
        tags: tags || [],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Prospects API error:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Failed to create prospect' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Prospects route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy');
    const sortOrder = searchParams.get('sortOrder');
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';

    const queryString = new URLSearchParams({
      ...(status && { status }),
      ...(search && { search }),
      ...(sortBy && { sortBy }),
      ...(sortOrder && { sortOrder }),
      limit,
      offset,
    }).toString();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/v1/prospects?${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch prospects: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Prospects GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prospects' },
      { status: 500 }
    );
  }
}

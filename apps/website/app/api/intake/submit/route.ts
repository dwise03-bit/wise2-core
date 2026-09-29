import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { success: false, error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    const body = await request.text();
    if (!body || body.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Request body is empty' },
        { status: 400 }
      );
    }

    let formData;
    try {
      formData = JSON.parse(body);
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    if (!formData.fullName || !formData.email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: fullName, email' },
        { status: 400 }
      );
    }

    console.log('Intake form submitted:', {
      timestamp: new Date().toISOString(),
      fullName: formData.fullName,
      companyName: formData.companyName,
      email: formData.email,
      phone: formData.phone,
      projectDescription: formData.projectDescription,
      services: formData.services,
      fileUrls: formData.fileUrls,
      agreement: formData.agreement,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you! Your intake form has been received.',
        submissionId: `intake-${Date.now()}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Intake submission error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { success: false, error: 'Submission failed. Please try again.' },
      { status: 500 }
    );
  }
}
